import { FieldValue } from "firebase-admin/firestore";
import { getAdminServices } from "./_firebaseAdmin.js";

/**
 * Server-authoritative order creation.
 *
 * This used to run as a client-side Firestore transaction (see
 * src/services/orderService.js's git history). That required a security
 * rule letting any signed-in customer decrement a product's `quantity`
 * directly - narrowly scoped, but still a standing hole: nothing tied that
 * decrement to a real order, so a malicious account could drain stock
 * without ever checking out.
 *
 * Running this with the Admin SDK closes that hole: Admin SDK writes bypass
 * Firestore security rules entirely, so `orders/create` and the matching
 * `products.quantity` decrement can now be fully denied to clients in
 * firestore.rules, and only this verified, re-validated path can perform
 * them.
 */

const ORDERS_COLLECTION = "orders";
const PRODUCTS_COLLECTION = "products";
const MAX_DISTINCT_ITEMS = 20;
const PHONE_REGEX = /^01[3-9][0-9]{8}$/;

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

function cleanText(value) {
  return String(value || "").trim();
}

/** Collapses the client cart into { productId, quantity } pairs. Prices,
 * names and images from the client are discarded - they're re-read from
 * Firestore inside the transaction below. */
function mergeRequestedItems(items) {
  const map = new Map();

  (Array.isArray(items) ? items : []).forEach((item) => {
    const productId = String(item?.productId || item?.id || "").trim();
    const quantity = Math.floor(
      Number(item?.quantity ?? item?.quantityInCart) || 0
    );

    if (!productId || quantity <= 0) return;

    map.set(productId, (map.get(productId) || 0) + quantity);
  });

  return Array.from(map, ([productId, quantity]) => ({ productId, quantity }));
}

function validateCustomer(body) {
  const customerName = cleanText(body.customerName);
  const phone = cleanText(body.phone);
  const secondaryPhone = cleanText(body.secondaryPhone);
  const address = cleanText(body.address);
  const note = cleanText(body.note);

  if (!customerName) throw new Error("Customer name is required.");
  if (customerName.length > 100) {
    throw new Error("Name must be 100 characters or less.");
  }
  if (!PHONE_REGEX.test(phone)) {
    throw new Error("Phone number must be 11 digits and start with 01.");
  }
  if (secondaryPhone && !PHONE_REGEX.test(secondaryPhone)) {
    throw new Error(
      "Secondary phone number must be 11 digits and start with 01."
    );
  }
  if (!address) throw new Error("Delivery address is required.");
  if (address.length > 500) {
    throw new Error("Address must be 500 characters or less.");
  }
  if (note.length > 500) throw new Error("Note must be 500 characters or less.");

  return { customerName, phone, secondaryPhone, address, note };
}

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return json(405, { message: "Method not allowed." });
  }

  let adminAuth;
  let adminDb;

  try {
    ({ adminAuth, adminDb } = getAdminServices());
  } catch (error) {
    console.error("Firebase Admin not configured:", error);
    return json(500, { message: "Order service is temporarily unavailable." });
  }

  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return json(401, { message: "You must be signed in to place an order." });
  }

  let userId;
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    userId = decoded.uid;
  } catch (error) {
    return json(401, { message: "Your session has expired. Please sign in again." });
  }

  let body;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return json(400, { message: "Invalid request body." });
  }

  let customer;
  try {
    customer = validateCustomer(body);
  } catch (error) {
    return json(400, { message: error.message });
  }

  const requested = mergeRequestedItems(body.items);

  if (requested.length === 0) {
    return json(400, { message: "Cart is empty." });
  }
  if (requested.length > MAX_DISTINCT_ITEMS) {
    return json(400, {
      message: `You can order at most ${MAX_DISTINCT_ITEMS} different products at once.`,
    });
  }

  const orderRef = adminDb.collection(ORDERS_COLLECTION).doc();

  try {
    const { items, total } = await adminDb.runTransaction(async (tx) => {
      const productRefs = requested.map((entry) =>
        adminDb.collection(PRODUCTS_COLLECTION).doc(entry.productId)
      );

      const snapshots = await tx.getAll(...productRefs);

      const items = snapshots.map((snapshot, index) => {
        const { productId, quantity } = requested[index];

        if (!snapshot.exists) {
          throw new Error("A product in your cart is no longer available.");
        }

        const product = snapshot.data();
        const label = product.name || "A product in your cart";

        if (product.status === "inactive") {
          throw new Error(`${label} is no longer available.`);
        }

        const stock = Number(product.quantity) || 0;

        if (stock <= 0) throw new Error(`${label} is out of stock.`);
        if (stock < quantity) {
          throw new Error(`Only ${stock} left of ${label}.`);
        }

        return {
          productId,
          name: String(label),
          price: Number(product.price) || 0, // server price, not the client's
          quantity,
          imageUrl: String(product.imageUrl || product.images?.[0] || ""),
        };
      });

      const total = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      if (total <= 0) throw new Error("Order total is invalid.");

      snapshots.forEach((snapshot, index) => {
        const current = Number(snapshot.data().quantity) || 0;
        tx.update(productRefs[index], {
          quantity: current - items[index].quantity,
        });
      });

      tx.set(orderRef, {
        customerName: customer.customerName,
        phone: customer.phone,
        ...(customer.secondaryPhone ? { secondaryPhone: customer.secondaryPhone } : {}),
        address: customer.address,
        note: customer.note,
        items,
        total,
        status: "pending",
        stockRestored: false,
        userId,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return { items, total };
    });

    return json(200, { id: orderRef.id, items, total });
  } catch (error) {
    console.error("Error creating order:", error);
    return json(400, { message: error.message || "Failed to place order." });
  }
}

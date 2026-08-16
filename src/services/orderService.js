import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  runTransaction,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { auth, db } from "./firebase/firebaseConfig";

const ORDERS_COLLECTION = "orders";
const PRODUCTS_COLLECTION = "products";

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "delivered",
  "cancelled",
];

function cleanText(value) {
  return String(value || "").trim();
}

/**
 * Creates an order via the create-order Netlify Function, which runs under
 * the Firebase Admin SDK instead of the browser's Firestore SDK.
 *
 * This used to be a client-side Firestore transaction. That worked, but it
 * required a security rule letting any signed-in customer decrement a
 * product's `quantity` directly - narrowly scoped (quantity only, only
 * downward), but still a standing hole, since nothing could tie that
 * decrement to a real order. Admin SDK writes bypass security rules
 * entirely, so moving order creation here let firestore.rules go back to
 * denying clients direct write access to both `orders` and `products`
 * entirely - only this verified, server-revalidated path can create an
 * order or touch stock now.
 *
 * Returns { id, items, total } using the server-verified items/total, not
 * the client's cart snapshot - so callers can show the customer what was
 * actually saved rather than what the (possibly stale) cart said.
 */
export const createOrder = async (orderData) => {
  const user = auth.currentUser;

  // Checkout is gated behind RequireCustomerAuth, so this should never fire.
  if (!user) throw new Error("You must be signed in to place an order.");

  try {
    const idToken = await user.getIdToken();

    const response = await fetch("/.netlify/functions/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
      },
      body: JSON.stringify({
        customerName: orderData.customerName,
        phone: orderData.phone,
        secondaryPhone: orderData.secondaryPhone,
        address: orderData.address,
        note: orderData.note,
        items: orderData.items,
      }),
    });

    const payload = await response.json().catch(() => null);

    if (!response.ok) {
      throw new Error(payload?.message || "Failed to place order.");
    }

    return payload;
  } catch (error) {
    console.error("Error creating order:", error);
    throw error;
  }
};

export const getOrders = async () => {
  try {
    const ordersQuery = query(
      collection(db, ORDERS_COLLECTION),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(ordersQuery);

    return snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    console.error("Error getting orders:", error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const orderSnap = await getDoc(doc(db, ORDERS_COLLECTION, orderId));

    if (!orderSnap.exists()) return null;

    return { id: orderSnap.id, ...orderSnap.data() };
  } catch (error) {
    console.error("Error getting order:", error);
    throw error;
  }
};

/**
 * Updates order status. Two fixes vs the old version:
 *   1. adminNote is only written when you actually pass one, so changing status
 *      no longer silently wipes an existing note.
 *   2. Cancelling an order returns its stock to the products, exactly once
 *      (guarded by the stockRestored flag).
 */
export const updateOrderStatus = async (orderId, status, adminNote) => {
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error("Invalid order status.");
  }

  const orderRef = doc(db, ORDERS_COLLECTION, orderId);

  try {
    await runTransaction(db, async (tx) => {
      const orderSnap = await tx.get(orderRef);

      if (!orderSnap.exists()) throw new Error("Order not found.");

      const order = orderSnap.data();
      const orderItems = Array.isArray(order.items) ? order.items : [];

      const shouldRestock =
        status === "cancelled" &&
        order.status !== "cancelled" &&
        order.stockRestored !== true;

      const productRefs = shouldRestock
        ? orderItems.map((item) =>
            doc(db, PRODUCTS_COLLECTION, String(item.productId))
          )
        : [];

      const snapshots = [];
      for (const productRef of productRefs) {
        snapshots.push(await tx.get(productRef));
      }

      snapshots.forEach((snapshot, index) => {
        if (!snapshot.exists()) return; // product was deleted; nothing to restock

        const current = Number(snapshot.data().quantity) || 0;
        const returning = Number(orderItems[index].quantity) || 0;

        tx.update(productRefs[index], { quantity: current + returning });
      });

      const updates = { status, updatedAt: serverTimestamp() };

      if (typeof adminNote === "string") {
        updates.adminNote = cleanText(adminNote);
      }

      if (shouldRestock) updates.stockRestored = true;

      tx.update(orderRef, updates);
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    return await deleteDoc(doc(db, ORDERS_COLLECTION, orderId));
  } catch (error) {
    console.error("Error deleting order:", error);
    throw error;
  }
};

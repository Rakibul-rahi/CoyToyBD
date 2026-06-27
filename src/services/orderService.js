import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";

const ORDERS_COLLECTION = "orders";

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

function cleanOrderItems(items = []) {
  return items.map((item) => ({
    productId: String(item.productId || item.id || ""),
    name: String(item.name || ""),
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    imageUrl: String(item.imageUrl || item.images?.[0] || item.image || ""),
  }));
}

function calculateTotal(items = []) {
  return items.reduce((sum, item) => {
    return sum + Number(item.price || 0) * Number(item.quantity || 0);
  }, 0);
}

export const createOrder = async (orderData) => {
  try {
    const customerName = cleanText(orderData.customerName);
    const phone = cleanText(orderData.phone);
    const address = cleanText(orderData.address);
    const note = cleanText(orderData.note);
    const items = cleanOrderItems(orderData.items || []);
    const total = calculateTotal(items);

    if (!customerName) {
      throw new Error("Customer name is required.");
    }

    if (!/^01[0-9]{9}$/.test(phone)) {
      throw new Error("Phone number must be 11 digits and start with 01.");
    }

    if (!address) {
      throw new Error("Delivery address is required.");
    }

    if (items.length === 0) {
      throw new Error("Cart is empty.");
    }

    if (total <= 0) {
      throw new Error("Order total is invalid.");
    }

    const orderRef = await addDoc(collection(db, ORDERS_COLLECTION), {
      customerName,
      phone,
      address,
      note,
      items,
      total,
      status: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return orderRef;
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
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const orderSnap = await getDoc(orderRef);

    if (!orderSnap.exists()) {
      return null;
    }

    return {
      id: orderSnap.id,
      ...orderSnap.data(),
    };
  } catch (error) {
    console.error("Error getting order:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status, adminNote = "") => {
  try {
    if (!ORDER_STATUSES.includes(status)) {
      throw new Error("Invalid order status.");
    }

    const orderRef = doc(db, ORDERS_COLLECTION, orderId);

    return await updateDoc(orderRef, {
      status,
      adminNote: cleanText(adminNote),
      updatedAt: serverTimestamp(),
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
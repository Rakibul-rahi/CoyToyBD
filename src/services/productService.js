import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";

export const addProduct = async (productData) => {
  return await addDoc(collection(db, "products"), {
    ...productData,
    createdAt: serverTimestamp(),
  });
};

export const getProducts = async () => {
  const snapshot = await getDocs(collection(db, "products"));

  return snapshot.docs.map((docItem) => ({
    id: docItem.id,
    ...docItem.data(),
  }));
};

export const deleteProduct = async (productId) => {
  return await deleteDoc(doc(db, "products", productId));
};

export const updateProduct = async (productId, updatedData) => {
  return await updateDoc(doc(db, "products", productId), updatedData);
};
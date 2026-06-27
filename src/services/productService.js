import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  deleteDoc,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";

const PRODUCTS_COLLECTION = "products";

export const addProduct = async (productData) => {
  try {
    const images = Array.isArray(productData.images)
      ? productData.images.slice(0, 4)
      : productData.imageUrl
      ? [productData.imageUrl]
      : [];

    const productRef = await addDoc(collection(db, PRODUCTS_COLLECTION), {
      name: productData.name || "",
      category: productData.category || "Unsorted",
      price: Number(productData.price) || 0,
      quantity: Number(productData.quantity) || 0,
      description: productData.description || "",
      images,
      imageUrl: productData.imageUrl || images[0] || "",
      imagePublicId: productData.imagePublicId || "",
      status: productData.status || "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return productRef;
  } catch (error) {
    console.error("Error adding product:", error);
    throw error;
  }
};

export const getProducts = async () => {
  try {
    const productsQuery = query(
      collection(db, PRODUCTS_COLLECTION),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(productsQuery);

    return snapshot.docs.map((docItem) => ({
      id: docItem.id,
      ...docItem.data(),
    }));
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
};

export const getProductById = async (productId) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);
    const productSnap = await getDoc(productRef);

    if (!productSnap.exists()) {
      return null;
    }

    return {
      id: productSnap.id,
      ...productSnap.data(),
    };
  } catch (error) {
    console.error("Error getting product:", error);
    throw error;
  }
};

export const updateProduct = async (productId, updatedData) => {
  try {
    const productRef = doc(db, PRODUCTS_COLLECTION, productId);

    const images = Array.isArray(updatedData.images)
      ? updatedData.images.slice(0, 4)
      : updatedData.imageUrl
      ? [updatedData.imageUrl]
      : [];

    return await updateDoc(productRef, {
      name: updatedData.name || "",
      category: updatedData.category || "Unsorted",
      price: Number(updatedData.price) || 0,
      quantity: Number(updatedData.quantity) || 0,
      description: updatedData.description || "",
      images,
      imageUrl: updatedData.imageUrl || images[0] || "",
      imagePublicId: updatedData.imagePublicId || "",
      status: updatedData.status || "active",
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProduct = async (productId) => {
  try {
    return await deleteDoc(doc(db, PRODUCTS_COLLECTION, productId));
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};
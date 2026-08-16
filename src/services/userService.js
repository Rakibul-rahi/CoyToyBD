import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase/firebaseConfig";

const USERS_COLLECTION = "users";

/**
 * Writes the customer's profile doc. Must match validUserProfile() in
 * firestore.rules exactly: name, phone, email, createdAt, updatedAt - no
 * more, no less.
 */
export const createUserProfile = async (uid, { name, phone, email }) => {
  await setDoc(doc(db, USERS_COLLECTION, uid), {
    name,
    phone,
    email,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

/**
 * Returns the signed-in customer's profile doc, or null if they signed up
 * before this doc existed (or it's still loading in practice - callers
 * should treat a null phone as "let them type one in").
 */
export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, USERS_COLLECTION, uid));
  return snap.exists() ? snap.data() : null;
};

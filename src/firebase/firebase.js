import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";

// Config diambil dari .env (lihat .env.example) — jangan hardcode di sini.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

const googleProvider = new GoogleAuthProvider();

/**
 * Kalau ini pertama kalinya user ini login, bikinin dokumen profil di
 * Firestore (users/{uid}). Kalau dokumennya udah ada, gak ngapa-ngapain.
 * Ini yang jadi "fallback register" — jalan otomatis di background,
 * gak ada perubahan apapun di layar.
 */
async function ensureUserProfile(user) {
  if (!user) return;
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      displayName: user.displayName ?? "",
      email: user.email ?? "",
      photoURL: user.photoURL ?? "",
      createdAt: serverTimestamp(),
    });
  }
}

/** Buka popup login Google, return user Firebase kalau sukses. */
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);
  await ensureUserProfile(result.user);
  return result.user;
}

export function logout() {
  return signOut(auth);
}

/** Helper subscribe status login, dipakai di context/provider auth. */
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

export default app;
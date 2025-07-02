import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  orderBy,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Use Vite's import.meta.env for environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);

// --- Types ---
export interface BlogPostInput {
  title: string;
  content: string;
  authorId: string;
  authorEmail: string;
}
export interface BlogPostUpdate {
  title: string;
  content: string;
}
export interface CommentInput {
  postId: string;
  content: string;
  authorId: string;
  authorEmail: string;
}
export interface CommentUpdate {
  content: string;
}

// --- CRUD for Blog Posts ---
export async function createPost({ title, content, authorId, authorEmail }: BlogPostInput) {
  return addDoc(collection(db, "posts"), {
    title,
    content,
    authorId,
    authorEmail,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getPosts() {
  const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function updatePost(postId: string, { title, content }: BlogPostUpdate) {
  const ref = doc(db, "posts", postId);
  return updateDoc(ref, { title, content, updatedAt: serverTimestamp() });
}

export async function deletePost(postId: string) {
  return deleteDoc(doc(db, "posts", postId));
}

export async function getPost(postId: string) {
  const ref = doc(db, "posts", postId);
  const snapshot = await getDoc(ref);
  return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() } : null;
}

// --- CRUD for Comments ---
export async function addComment({ postId, content, authorId, authorEmail }: CommentInput) {
  return addDoc(collection(db, "comments"), {
    postId,
    content,
    authorId,
    authorEmail,
    createdAt: serverTimestamp(),
  });
}

export async function getComments(postId: string) {
  const q = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function deleteComment(commentId: string) {
  return deleteDoc(doc(db, "comments", commentId));
}

export async function updateComment(commentId: string, { content }: CommentUpdate) {
  const ref = doc(db, "comments", commentId);
  return updateDoc(ref, { content });
}

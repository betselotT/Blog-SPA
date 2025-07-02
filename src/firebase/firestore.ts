import {
    collection,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDocs,
    getDoc,
    query,
    orderBy,
    where,
    serverTimestamp,
    onSnapshot,
  } from "firebase/firestore"
  import { db } from "./client"
  import type { User } from "firebase/auth"
  
  export interface BlogPost {
    id: string
    title: string
    content: string
    excerpt: string
    author: string
    authorId: string
    category: string
    createdAt: any
    updatedAt: any
  }
  
  export interface Comment {
    id: string
    postId: string
    content: string
    author: string
    authorId: string
    createdAt: any
  }
  
  // Blog Posts CRUD
  export const createBlogPost = async (
    user: User,
    postData: {
      title: string
      content: string
      excerpt: string
      category: string
    },
  ): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, "posts"), {
        ...postData,
        author: user.displayName || user.email || "Anonymous",
        authorId: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error creating blog post:", error)
      throw error
    }
  }
  
  export const updateBlogPost = async (
    postId: string,
    postData: {
      title: string
      content: string
      excerpt: string
      category: string
    },
  ): Promise<void> => {
    try {
      const postRef = doc(db, "posts", postId)
      await updateDoc(postRef, {
        ...postData,
        updatedAt: serverTimestamp(),
      })
    } catch (error) {
      console.error("Error updating blog post:", error)
      throw error
    }
  }
  
  export const deleteBlogPost = async (postId: string): Promise<void> => {
    try {
      // Delete all comments for this post first
      const commentsQuery = query(collection(db, "comments"), where("postId", "==", postId))
      const commentsSnapshot = await getDocs(commentsQuery)
  
      const deletePromises = commentsSnapshot.docs.map((commentDoc) => deleteDoc(doc(db, "comments", commentDoc.id)))
      await Promise.all(deletePromises)
  
      // Then delete the post
      await deleteDoc(doc(db, "posts", postId))
    } catch (error) {
      console.error("Error deleting blog post:", error)
      throw error
    }
  }
  
  export const getBlogPosts = async (): Promise<BlogPost[]> => {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BlogPost[]
    } catch (error) {
      console.error("Error fetching blog posts:", error)
      throw error
    }
  }
  
  export const getBlogPost = async (postId: string): Promise<BlogPost | null> => {
    try {
      const docRef = doc(db, "posts", postId)
      const docSnap = await getDoc(docRef)
  
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as BlogPost
      }
      return null
    } catch (error) {
      console.error("Error fetching blog post:", error)
      throw error
    }
  }
  
  // Comments CRUD
  export const addComment = async (user: User, postId: string, content: string): Promise<string> => {
    try {
      const docRef = await addDoc(collection(db, "comments"), {
        postId,
        content,
        author: user.displayName || user.email || "Anonymous",
        authorId: user.uid,
        createdAt: serverTimestamp(),
      })
      return docRef.id
    } catch (error) {
      console.error("Error adding comment:", error)
      throw error
    }
  }
  
  export const getComments = async (postId: string): Promise<Comment[]> => {
    try {
      const q = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "desc"))
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[]
    } catch (error) {
      console.error("Error fetching comments:", error)
      throw error
    }
  }
  
  export const deleteComment = async (commentId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, "comments", commentId))
    } catch (error) {
      console.error("Error deleting comment:", error)
      throw error
    }
  }
  
  // Real-time listeners
  export const subscribeToBlogPosts = (callback: (posts: BlogPost[]) => void) => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"))
    return onSnapshot(q, (querySnapshot) => {
      const posts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as BlogPost[]
      callback(posts)
    })
  }
  
  export const subscribeToComments = (postId: string, callback: (comments: Comment[]) => void) => {
    const q = query(collection(db, "comments"), where("postId", "==", postId), orderBy("createdAt", "desc"))
    return onSnapshot(q, (querySnapshot) => {
      const comments = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Comment[]
      callback(comments)
    })
  }
  
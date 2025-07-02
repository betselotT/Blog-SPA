import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    type User,
  } from "firebase/auth"
  import { auth } from "../firebase/client"
  
  // Sign in with email and password
  export const signInWithEmail = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error: any) {
      throw new Error(error.message || "Failed to sign in")
    }
  }
  
  // Sign up with email and password
  export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error: any) {
      throw new Error(error.message || "Failed to create account")
    }
  }
  
  // Sign in with Google
  export const signInWithGoogle = async (): Promise<User> => {
    try {
      const provider = new GoogleAuthProvider()
      provider.addScope("email")
      provider.addScope("profile")
  
      const userCredential = await signInWithPopup(auth, provider)
      return userCredential.user
    } catch (error: any) {
      throw new Error(error.message || "Failed to sign in with Google")
    }
  }
  
  // Sign out
  export const signOut = async (): Promise<void> => {
    try {
      await auth.signOut()
    } catch (error: any) {
      throw new Error(error.message || "Failed to sign out")
    }
  }
  
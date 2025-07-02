import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    signOut as firebaseSignOut,
    type User,
  } from "firebase/auth"
  import { auth } from "./client"
  
  // Sign in with email and password
  export const signInWithEmail = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error: any) {
      // Handle specific Firebase auth errors
      switch (error.code) {
        case "auth/user-not-found":
          throw new Error("No account found with this email address")
        case "auth/wrong-password":
          throw new Error("Incorrect password")
        case "auth/invalid-email":
          throw new Error("Invalid email address")
        case "auth/user-disabled":
          throw new Error("This account has been disabled")
        case "auth/too-many-requests":
          throw new Error("Too many failed attempts. Please try again later")
        default:
          throw new Error(error.message || "Failed to sign in")
      }
    }
  }
  
  // Sign up with email and password
  export const signUpWithEmail = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      return userCredential.user
    } catch (error: any) {
      // Handle specific Firebase auth errors
      switch (error.code) {
        case "auth/email-already-in-use":
          throw new Error("An account with this email already exists")
        case "auth/invalid-email":
          throw new Error("Invalid email address")
        case "auth/operation-not-allowed":
          throw new Error("Email/password accounts are not enabled")
        case "auth/weak-password":
          throw new Error("Password should be at least 6 characters")
        default:
          throw new Error(error.message || "Failed to create account")
      }
    }
  }
  
  // Sign in with Google
  export const signInWithGoogle = async (): Promise<User> => {
    try {
      const provider = new GoogleAuthProvider()
      provider.addScope("email")
      provider.addScope("profile")
  
      // Add custom parameters for better UX
      provider.setCustomParameters({
        prompt: "select_account",
      })
  
      const userCredential = await signInWithPopup(auth, provider)
      return userCredential.user
    } catch (error: any) {
      // Handle specific Firebase auth errors
      switch (error.code) {
        case "auth/popup-closed-by-user":
          throw new Error("Sign-in was cancelled")
        case "auth/popup-blocked":
          throw new Error("Popup was blocked by your browser")
        case "auth/account-exists-with-different-credential":
          throw new Error("An account already exists with the same email but different sign-in credentials")
        default:
          throw new Error(error.message || "Failed to sign in with Google")
      }
    }
  }
  
  // Sign out
  export const signOut = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth)
    } catch (error: any) {
      throw new Error(error.message || "Failed to sign out")
    }
  }
  
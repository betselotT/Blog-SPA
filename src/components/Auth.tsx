"use client"

import type React from "react"
import { useState } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { Eye, EyeOff, Mail, Lock, Chrome, Loader2, Sparkles, AlertCircle } from "lucide-react"

import { signInWithEmail, signUpWithEmail, signInWithGoogle } from "../firebase/auth"
import { useAuth } from "../App"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription } from "./ui/alert"
import ThemeToggle from "../components/ThemeToggle"

const Auth: React.FC = () => {
  const { user, loading } = useAuth()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/"

  const [mode, setMode] = useState<"signin" | "signup">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirect if already authenticated
  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
        <Card className="border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl">
          <CardContent className="flex items-center gap-4 p-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
            <span className="text-lg font-semibold text-gray-900 dark:text-gray-100">Loading...</span>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (user) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setError(null)

    try {
      if (mode === "signin") {
        await signInWithEmail(email, password)
      } else {
        await signUpWithEmail(email, password)
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed")
    } finally {
      setAuthLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    setError(null)

    try {
      await signInWithGoogle()
    } catch (err: any) {
      setError(err.message || "Google sign-in failed")
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 p-4 transition-colors duration-300">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 dark:bg-white/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 dark:bg-white/3 rounded-full blur-3xl animate-pulse" />
      </div>

      <Card className="w-full max-w-md border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl shadow-2xl relative z-10 transition-colors duration-300">
        <CardHeader className="space-y-6 text-center pb-8">
          {/* Logo */}
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Sparkles className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 dark:from-gray-100 dark:to-blue-400 bg-clip-text text-transparent">
              {mode === "signin" ? "Welcome Back" : "Get Started"}
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-300">
              {mode === "signin"
                ? "Sign in to access your personalized blog experience"
                : "Create your account and join our community"}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Mode Toggle */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
            <Button
              type="button"
              variant={mode === "signin" ? "default" : "ghost"}
              onClick={() => setMode("signin")}
              disabled={authLoading || googleLoading}
              className={`h-10 font-semibold transition-all ${
                mode === "signin"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Sign In
            </Button>
            <Button
              type="button"
              variant={mode === "signup" ? "default" : "ghost"}
              onClick={() => setMode("signup")}
              disabled={authLoading || googleLoading}
              className={`h-10 font-semibold transition-all ${
                mode === "signup"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 text-white shadow-md"
                  : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              }`}
            >
              Sign Up
            </Button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={authLoading || googleLoading}
                  className="pl-10 h-12 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={authLoading || googleLoading}
                  className="pl-10 pr-10 h-12 border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={authLoading || googleLoading}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                  )}
                </Button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={authLoading || googleLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 dark:from-blue-500 dark:to-purple-500 dark:hover:from-blue-600 dark:hover:to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {authLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {mode === "signin" ? "Signing in..." : "Creating account..."}
                </>
              ) : mode === "signin" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-200 dark:border-gray-600" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white dark:bg-gray-800 px-4 text-gray-500 dark:text-gray-400 font-medium">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={authLoading || googleLoading}
            className="w-full h-12 border-2 hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-600 dark:text-gray-200 font-semibold transition-all duration-200 bg-transparent"
          >
            {googleLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Chrome className="mr-2 h-5 w-5" />
                Continue with Google
              </>
            )}
          </Button>

          {/* Error Message */}
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800 dark:text-red-200 font-medium">{error}</AlertDescription>
            </Alert>
          )}

          {/* Footer */}
          <div className="text-center pt-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {mode === "signin" ? (
                <>
                  Don't have an account?{" "}
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setMode("signup")}
                    disabled={authLoading || googleLoading}
                    className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Sign up
                  </Button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setMode("signin")}
                    disabled={authLoading || googleLoading}
                    className="p-0 h-auto font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    Sign in
                  </Button>
                </>
              )}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Auth

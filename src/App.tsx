"use client"

import type React from "react"
import { useEffect, useState, createContext, useContext } from "react"
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom"
import Auth from "./components/Auth"
import BlogEditor from "./components/BlogEditor"
import BlogDetail from "./components/BlogDetail"
import BlogCard from "./components/BlogCard"
import { onAuthStateChanged } from "firebase/auth"
import type { User } from "firebase/auth"
import { auth } from "./firebase/client"
import { Plus, Search, Filter, LogOut, UserIcon } from "lucide-react"
import { Button } from "./components/ui/button"
import { Input } from "./components/ui/input"
import { subscribeToBlogPosts, type BlogPost } from "./firebase/firestore"
import FirestoreSetup from "./components/FirestoreSetup"
import { ThemeProvider } from "./contexts/ThemeContext"
import ThemeToggle from "./components/ThemeToggle"

// Auth context
const AuthContext = createContext<{ user: User | null; loading: boolean }>({ user: null, loading: true })

export const useAuth = () => useContext(AuthContext)

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/auth" state={{ from: location }} replace />

  return <>{children}</>
}

function BlogList() {
  const { user } = useAuth()
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [loading, setLoading] = useState(true)
  const [permissionError, setPermissionError] = useState(false)

  useEffect(() => {
    const unsubscribe = subscribeToBlogPosts((blogsData) => {
      setBlogs(blogsData)
      setLoading(false)
      setPermissionError(false)
    })
    return () => unsubscribe()
  }, [])

  // Show setup guide if permission error
  if (permissionError) {
    return <FirestoreSetup />
  }

  const categories = ["All", ...Array.from(new Set(blogs.map((blog) => blog.category)))]

  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || blog.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleSignOut = async () => {
    try {
      await auth.signOut()
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading posts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-blue-600 bg-clip-text text-transparent">
                  My Blog
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Thoughts & Ideas</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => (window.location.href = "/create")}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Post</span>
              </Button>
              <ThemeToggle />
              <div className="hidden sm:flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-300">
                <UserIcon className="w-4 h-4" />
                <span className="font-medium">{user?.email}</span>
              </div>
              <Button
                onClick={handleSignOut}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors bg-transparent"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 dark:from-gray-800 dark:via-blue-900 dark:to-indigo-900 text-white py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Welcome to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-pink-400">My Blog</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Share your thoughts, discover insights, and connect with the community
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 text-lg bg-white/10 backdrop-blur-xl border-white/20 text-white placeholder-white/70 focus:bg-white/20 focus:border-white/40 rounded-2xl"
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Category Filter */}
        <div className="mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filter by Category</h3>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`rounded-full transition-all duration-200 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "hover:bg-blue-50 hover:border-blue-200"
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Blog Posts Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Latest Articles</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
            </div>
            <p className="text-gray-600 dark:text-gray-300">
              {filteredBlogs.length} article{filteredBlogs.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {filteredBlogs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">No articles found</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                {blogs.length === 0 ? "Be the first to create a post!" : "Try adjusting your search or filter criteria"}
              </p>
              {blogs.length === 0 && (
                <Button
                  onClick={() => (window.location.href = "/create")}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Post
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {filteredBlogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <h3 className="text-2xl font-bold">My Blog</h3>
            </div>
            <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
              A platform for sharing knowledge and connecting with the community. Built with React, Firebase, and
              Tailwind CSS.
            </p>
            <div className="border-t border-gray-700 pt-6">
              <p className="text-gray-500">© 2024 My Blog. All rights reserved. Built with ❤️ and React.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <RequireAuth>
                  <BlogList />
                </RequireAuth>
              }
            />
            <Route
              path="/create"
              element={
                <RequireAuth>
                  <BlogEditor />
                </RequireAuth>
              }
            />
            <Route
              path="/edit/:id"
              element={
                <RequireAuth>
                  <BlogEditor />
                </RequireAuth>
              }
            />
            <Route
              path="/post/:id"
              element={
                <RequireAuth>
                  <BlogDetail />
                </RequireAuth>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

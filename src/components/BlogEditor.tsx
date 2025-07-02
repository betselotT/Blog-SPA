"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save, X } from "lucide-react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Alert, AlertDescription } from "./ui/alert"
import { useAuth } from "../App"
import { createBlogPost, updateBlogPost, getBlogPost } from "../firebase/firestore"

const categories = ["Development", "Design", "Architecture", "Technology", "Performance", "Tutorial", "Opinion"]

const BlogEditor: React.FC = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)

  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [category, setCategory] = useState("Development")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(isEditing)

  useEffect(() => {
    if (isEditing && id) {
      loadPost(id)
    }
  }, [id, isEditing])

  const loadPost = async (postId: string) => {
    try {
      setInitialLoading(true)
      const post = await getBlogPost(postId)
      if (post) {
        if (post.authorId !== user?.uid) {
          setError("You don't have permission to edit this post")
          return
        }
        setTitle(post.title)
        setContent(post.content)
        setExcerpt(post.excerpt)
        setCategory(post.category)
      } else {
        setError("Post not found")
      }
    } catch (err) {
      setError("Failed to load post")
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError(null)

    try {
      const postData = {
        title: title.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || content.substring(0, 150) + "...",
        category,
      }

      if (isEditing && id) {
        await updateBlogPost(id, postData)
      } else {
        await createBlogPost(user, postData)
      }

      navigate("/")
    } catch (err: any) {
      setError(err.message || `Failed to ${isEditing ? "update" : "create"} post`)
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading post...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50 backdrop-blur-xl bg-white/95">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              onClick={() => navigate("/")}
              variant="ghost"
              className="flex items-center space-x-2 hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Blog</span>
            </Button>
            <h1 className="text-xl font-bold text-gray-900">{isEditing ? "Edit Post" : "Create New Post"}</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900">
              {isEditing ? "Edit Your Post" : "Write a New Post"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-semibold text-gray-700">
                  Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter your post title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 text-lg border-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold text-gray-700">
                  Category *
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loading}
                  className="w-full h-12 px-3 border-2 border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt" className="text-sm font-semibold text-gray-700">
                  Excerpt
                </Label>
                <textarea
                  id="excerpt"
                  placeholder="Brief description of your post (optional - will be auto-generated if empty)..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  disabled={loading}
                  rows={3}
                  className="w-full px-3 py-3 border-2 border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-semibold text-gray-700">
                  Content *
                </Label>
                <textarea
                  id="content"
                  placeholder="Write your post content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                  disabled={loading}
                  rows={15}
                  className="w-full px-3 py-3 border-2 border-gray-200 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none font-mono text-sm"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/")}
                  disabled={loading}
                  className="flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !title.trim() || !content.trim()}
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Save className="w-4 h-4" />
                  <span>{loading ? "Saving..." : isEditing ? "Update Post" : "Publish Post"}</span>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default BlogEditor

"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save, X } from "lucide-react"
import { toast } from "sonner"
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
          toast.error("Permission denied", {
            description: "You can only edit your own posts.",
          })
          return
        }
        setTitle(post.title)
        setContent(post.content)
        setExcerpt(post.excerpt)
        setCategory(post.category)
      } else {
        setError("Post not found")
        toast.error("Post not found", {
          description: "The post you're trying to edit doesn't exist.",
        })
      }
    } catch (err) {
      setError("Failed to load post")
      toast.error("Failed to load post", {
        description: "There was an error loading the post. Please try again.",
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Title is required", {
        description: "Please enter a title for your post.",
      })
      return false
    }

    if (!content.trim()) {
      toast.error("Content is required", {
        description: "Please write some content for your post.",
      })
      return false
    }

    if (title.trim().length < 5) {
      toast.error("Title too short", {
        description: "Post title must be at least 5 characters long.",
      })
      return false
    }

    if (content.trim().length < 50) {
      toast.error("Content too short", {
        description: "Post content must be at least 50 characters long.",
      })
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!validateForm()) {
      return
    }

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
        toast.success("Post updated successfully!", {
          description: "Your changes have been saved and published.",
        })
      } else {
        await createBlogPost(user, postData)
        toast.success("Post published successfully!", {
          description: "Your new post is now live and visible to everyone.",
        })
      }

      navigate("/")
    } catch (err: any) {
      const errorMessage = err.message || `Failed to ${isEditing ? "update" : "create"} post`
      setError(errorMessage)
      toast.error(`Failed to ${isEditing ? "update" : "publish"} post`, {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading post...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 transition-colors duration-300">
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
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? "Edit Post" : "Create New Post"}
            </h1>
            <div className="w-24"></div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl transition-colors duration-300">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
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
                <Label htmlFor="title" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Title *
                </Label>
                <Input
                  id="title"
                  type="text"
                  placeholder="Enter your post title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={loading}
                  className="w-full h-12 px-3 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Category *
                </Label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={loading}
                  className="w-full h-12 px-3 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 bg-white dark:bg-gray-700 dark:text-gray-100"
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
                <Label htmlFor="excerpt" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Excerpt
                </Label>
                <textarea
                  id="excerpt"
                  placeholder="Brief description of your post (optional - will be auto-generated if empty)..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  disabled={loading}
                  rows={3}
                  className="w-full px-3 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none bg-white dark:bg-gray-700 dark:text-gray-100"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content" className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Content *
                </Label>
                <textarea
                  id="content"
                  placeholder="Write your post content here..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  disabled={loading}
                  rows={15}
                  className="w-full px-3 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none font-mono text-sm bg-white dark:bg-gray-700 dark:text-gray-100"
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
                  disabled={loading}
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

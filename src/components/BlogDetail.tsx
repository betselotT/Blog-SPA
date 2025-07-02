"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Calendar, Clock, UserIcon, Edit, Trash2, MessageCircle } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader } from "./ui/card"
import { useAuth } from "../App"
import { getBlogPost, deleteBlogPost, type BlogPost } from "../firebase/firestore"
import CommentSection from "./CommentSection"

const BlogDetail: React.FC = () => {
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      loadPost(id)
    }
  }, [id])

  const loadPost = async (postId: string) => {
    try {
      setLoading(true)
      const postData = await getBlogPost(postId)
      if (postData) {
        setPost(postData)
      } else {
        setError("Post not found")
      }
    } catch (err) {
      setError("Failed to load post")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!post || !user || post.authorId !== user.uid) return

    if (!confirm("Are you sure you want to delete this post? This action cannot be undone.")) {
      return
    }

    try {
      setDeleting(true)
      await deleteBlogPost(post.id)
      navigate("/")
    } catch (err) {
      setError("Failed to delete post")
      setDeleting(false)
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / wordsPerMinute)
    return `${readTime} min read`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading post...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Post Not Found</h2>
            <p className="text-gray-600 mb-4">{error || "The post you're looking for doesn't exist."}</p>
            <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-blue-600 to-purple-600">
              Back to Blog
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isAuthor = user?.uid === post.authorId

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
            {isAuthor && (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => navigate(`/edit/${post.id}`)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  size="sm"
                  disabled={deleting}
                  className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 bg-transparent"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>{deleting ? "Deleting..." : "Delete"}</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="space-y-8">
          {/* Post Header */}
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-xl">
            <CardHeader className="space-y-6">
              {/* Category Badge */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    post.category === "Development"
                      ? "bg-green-100 text-green-800"
                      : post.category === "Design"
                        ? "bg-purple-100 text-purple-800"
                        : post.category === "Architecture"
                          ? "bg-blue-100 text-blue-800"
                          : post.category === "Technology"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {post.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">{post.title}</h1>

              {/* Meta Information */}
              <div className="flex flex-wrap items-center gap-6 text-gray-600">
                <div className="flex items-center space-x-2">
                  <UserIcon className="w-5 h-5" />
                  <span className="font-medium">{post.author}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5" />
                  <span>{calculateReadTime(post.content)}</span>
                </div>
              </div>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xl text-gray-600 leading-relaxed border-l-4 border-blue-500 pl-6 italic">
                  {post.excerpt}
                </p>
              )}
            </CardHeader>
          </Card>

          {/* Post Content */}
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-xl">
            <CardContent className="py-8">
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">{post.content}</div>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-xl">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Comments</h2>
              </div>
            </CardHeader>
            <CardContent>
              <CommentSection postId={post.id} />
            </CardContent>
          </Card>
        </article>
      </main>
    </div>
  )
}

export default BlogDetail

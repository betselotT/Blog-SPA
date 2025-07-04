"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Calendar, Clock, UserIcon, Edit, Trash2, MessageCircle } from "lucide-react"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader } from "./ui/card"
import { useAuth } from "../App"
import { getBlogPost, deleteBlogPost, type BlogPost } from "../firebase/firestore"
import CommentSection from "./CommentSection"
import ConfirmDialog from "./ConfirmDialog"

const BlogDetail: React.FC = () => {
  const { user } = useAuth()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [post, setPost] = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
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
        toast.error("Post not found", {
          description: "The post you're looking for doesn't exist.",
        })
      }
    } catch (err) {
      setError("Failed to load post")
      toast.error("Failed to load post", {
        description: "There was an error loading the post. Please try again.",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = () => {
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    if (!post || !user || post.authorId !== user.uid) return

    try {
      setDeleting(true)
      await deleteBlogPost(post.id)
      toast.success("Post deleted successfully", {
        description: "Your post has been permanently removed.",
      })
      navigate("/")
    } catch (err) {
      setError("Failed to delete post")
      toast.error("Failed to delete post", {
        description: "There was an error deleting the post. Please try again.",
      })
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
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 font-medium">Loading post...</p>
        </div>
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 flex items-center justify-center">
        <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl transition-colors duration-300 max-w-md w-full mx-4">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Post Not Found</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {error || "The post you're looking for doesn't exist."}
            </p>
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
    <>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-100 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-xl bg-white/95 dark:bg-gray-800/95 transition-colors duration-300">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Button
                onClick={() => navigate("/")}
                variant="ghost"
                className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700"
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
                    className="flex items-center space-x-2 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:border-blue-600 dark:hover:text-blue-400"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    onClick={handleDeleteClick}
                    variant="outline"
                    size="sm"
                    className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:border-red-600 dark:hover:text-red-400 bg-transparent"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Delete</span>
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
            <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl transition-colors duration-300">
              <CardHeader className="space-y-6">
                {/* Category Badge */}
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      post.category === "Development"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                        : post.category === "Design"
                          ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                          : post.category === "Architecture"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                            : post.category === "Technology"
                              ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                    }`}
                  >
                    {post.category}
                  </span>
                </div>

                {/* Title */}
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                  {post.title}
                </h1>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center gap-6 text-gray-600 dark:text-gray-300">
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
                  <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed border-l-4 border-blue-500 pl-6 italic">
                    {post.excerpt}
                  </p>
                )}
              </CardHeader>
            </Card>

            {/* Post Content */}
            <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl transition-colors duration-300">
              <CardContent className="py-8">
                <div className="prose prose-lg max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200 leading-relaxed">
                    {post.content}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Comments Section */}
            <Card className="shadow-xl border-0 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl transition-colors duration-300">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Comments</h2>
                </div>
              </CardHeader>
              <CardContent>
                <CommentSection postId={post.id} />
              </CardContent>
            </Card>
          </article>
        </main>
      </div>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Post"
        description={`Are you sure you want to delete "${post.title}"? This action cannot be undone and will permanently remove the post and all its comments.`}
        confirmText="Delete Post"
        cancelText="Keep Post"
        variant="destructive"
        loading={deleting}
      />
    </>
  )
}

export default BlogDetail

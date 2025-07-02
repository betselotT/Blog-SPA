"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { MessageCircle, Send, Trash2, UserIcon, Calendar } from "lucide-react"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { Alert, AlertDescription } from "./ui/alert"
import { useAuth } from "../App"
import { addComment, subscribeToComments, deleteComment, type Comment } from "../firebase/firestore"

interface CommentSectionProps {
  postId: string
}

const CommentSection: React.FC<CommentSectionProps> = ({ postId }) => {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = subscribeToComments(postId, (commentsData) => {
      setComments(commentsData)
    })

    return () => unsubscribe()
  }, [postId])

  const validateComment = () => {
    if (!newComment.trim()) {
      toast.error("Comment cannot be empty", {
        description: "Please write something before posting your comment.",
      })
      return false
    }

    if (newComment.trim().length < 3) {
      toast.error("Comment too short", {
        description: "Comments must be at least 3 characters long.",
      })
      return false
    }

    if (newComment.trim().length > 1000) {
      toast.error("Comment too long", {
        description: "Comments cannot exceed 1000 characters.",
      })
      return false
    }

    return true
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !validateComment()) return

    setLoading(true)
    setError(null)

    try {
      await addComment(user, postId, newComment.trim())
      setNewComment("")
      toast.success("Comment posted!", {
        description: "Your comment has been added successfully.",
      })
    } catch (err: any) {
      const errorMessage = err.message || "Failed to add comment"
      setError(errorMessage)
      toast.error("Failed to post comment", {
        description: errorMessage,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Are you sure you want to delete this comment?")) return

    try {
      await deleteComment(commentId)
      toast.success("Comment deleted", {
        description: "Your comment has been removed successfully.",
      })
    } catch (err: any) {
      const errorMessage = err.message || "Failed to delete comment"
      setError(errorMessage)
      toast.error("Failed to delete comment", {
        description: errorMessage,
      })
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmitComment} className="space-y-4">
          <div className="space-y-2">
            <textarea
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={loading}
              rows={4}
              maxLength={1000}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 resize-none bg-white dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
            />
            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
              <span>{newComment.length}/1000 characters</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Commenting as <span className="font-medium">{user.displayName || user.email}</span>
            </p>
            <Button
              type="submit"
              disabled={loading || !newComment.trim()}
              className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? "Posting..." : "Post Comment"}</span>
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-xl">
          <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-300">Please sign in to leave a comment</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Comments List */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </h3>

        {comments.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300">No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 border border-gray-100 dark:border-gray-600 hover:bg-gray-100/50 dark:hover:bg-gray-600/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">{comment.author}</p>
                      <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  {user?.uid === comment.authorId && (
                    <Button
                      onClick={() => handleDeleteComment(comment.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CommentSection

"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Calendar, Clock, UserIcon, ArrowRight, Edit, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "./ui/button"
import { useAuth } from "../App"
import { deleteBlogPost, type BlogPost } from "../firebase/firestore"
import ConfirmDialog from "./ConfirmDialog"

interface BlogCardProps {
  blog: BlogPost
  onDelete?: () => void
}

const BlogCard: React.FC<BlogCardProps> = ({ blog, onDelete }) => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const isAuthor = user?.uid === blog.authorId

  const formatDate = (timestamp: any) => {
    if (!timestamp) return ""
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    const readTime = Math.ceil(wordCount / wordsPerMinute)
    return `${readTime} min read`
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    try {
      setDeleting(true)
      await deleteBlogPost(blog.id)
      toast.success("Post deleted successfully", {
        description: "Your post has been permanently removed.",
      })
      setShowDeleteDialog(false)
      onDelete?.()
    } catch (error) {
      console.error("Error deleting post:", error)
      toast.error("Failed to delete post", {
        description: "There was an error deleting the post. Please try again.",
      })
      setDeleting(false)
    }
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/edit/${blog.id}`)
  }

  const handleCardClick = () => {
    navigate(`/post/${blog.id}`)
  }

  return (
    <>
      <article
        onClick={handleCardClick}
        className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 cursor-pointer transform hover:-translate-y-1"
      >
        <div className="p-6 pb-4">
          <div className="flex items-center justify-between mb-4">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                blog.category === "Development"
                  ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                  : blog.category === "Design"
                    ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400"
                    : blog.category === "Architecture"
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                      : blog.category === "Technology"
                        ? "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
              }`}
            >
              {blog.category}
            </span>
            {isAuthor && (
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  onClick={handleEdit}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleDeleteClick}
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900 hover:text-red-600 dark:hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3 group-hover:text-blue-600 transition-colors duration-200 line-clamp-2 leading-tight">
            {blog.title}
          </h3>

          <p className="text-gray-600 dark:text-gray-300 mb-6 line-clamp-3 leading-relaxed">{blog.excerpt}</p>

          <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <UserIcon className="w-4 h-4" />
                <span className="font-medium text-gray-700 dark:text-gray-200">{blog.author}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(blog.createdAt)}</span>
              </div>
            </div>
            <div className="flex items-center space-x-1 text-blue-600 font-medium">
              <Clock className="w-4 h-4" />
              <span>{calculateReadTime(blog.content)}</span>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 group-hover:shadow-lg">
            <span>Read Article</span>
            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
          </Button>
        </div>
      </article>

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Delete Post"
        description={`Are you sure you want to delete "${blog.title}"? This action cannot be undone and will permanently remove the post and all its comments.`}
        confirmText="Delete Post"
        cancelText="Keep Post"
        variant="destructive"
        loading={deleting}
      />
    </>
  )
}

export default BlogCard

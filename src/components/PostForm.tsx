import React, { useState } from "react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import type { BlogPostInput, BlogPostUpdate } from "../firebase/client";

interface PostFormProps {
  initialValues?: Partial<BlogPostInput>;
  onSave: (values: BlogPostInput | BlogPostUpdate) => Promise<void>;
  loading?: boolean;
}

const PostForm: React.FC<PostFormProps> = ({ initialValues = {}, onSave, loading }) => {
  const [title, setTitle] = useState(initialValues.title || "");
  const [content, setContent] = useState(initialValues.content || "");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    try {
      await onSave(initialValues.authorId ? { title, content } : { title, content } as BlogPostInput);
      setTitle("");
      setContent("");
    } catch (err: any) {
      setError(err.message || "Failed to save post");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded bg-white shadow">
      <Input
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        disabled={loading}
        required
      />
      <textarea
        placeholder="Content"
        value={content}
        onChange={e => setContent(e.target.value)}
        className="w-full h-32 p-2 border rounded"
        disabled={loading}
        required
      />
      <Button type="submit" disabled={loading} className="w-full">
        {initialValues.title ? "Update Post" : "Create Post"}
      </Button>
      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </form>
  );
};

export default PostForm; 
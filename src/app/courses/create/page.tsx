"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { EditorContent, useEditor } from '@tiptap/react'
import { editorExtensions } from '@/lib/tiptap-extensions'

export default function CreateCoursePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState<number>(0)
  const [imageUrl, setImageUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Redirect unauthenticated users or non-instructors
  if (status === "loading") return <div>Loading...</div>
  if (status === "unauthenticated" || session?.user?.role !== "INSTRUCTOR") {
    router.push("/login")
    return null
  }

  // TipTap editor for course description
  const editor = useEditor({
    extensions: editorExtensions,
    content: description,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setDescription(editor.getHTML());
    }
  });

  // Update editor content when description changes
  useEffect(() => {
    if (editor) {
      editor.commands.setContent(description);
    }
  }, [description, editor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          price,
          imageUrl,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create course")
      }

      const course = await response.json()
      toast({
        title: "Success",
        description: "Course created successfully!",
      })
      router.push(`/courses/${course.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create course. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container py-10 pt-24 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-8">Create New Course</h1>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-1">
            Course Title
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
            Course Description
          </label>
          <div className="border rounded-md overflow-hidden">
            <EditorContent 
              editor={editor} 
              className="min-h-[200px] p-3 text-foreground bg-background placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-foreground mb-1">
            Price ($)
          </label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(parseFloat(e.target.value))}
            required
            min="0"
            step="0.01"
            disabled={isLoading}
          />
        </div>
        <div>
          <label htmlFor="imageUrl" className="block text-sm font-medium text-foreground mb-1">
            Image URL
          </label>
          <Input
            id="imageUrl"
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Creating..." : "Create Course"}
        </Button>
      </form>
    </div>
  )
} 
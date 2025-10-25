"use client"

import React from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { editorExtensions } from '@/lib/tiptap-extensions'

interface RichTextDisplayProps {
  content: string
  editable?: boolean
  className?: string
  maxHeight?: string
}

export function RichTextDisplay({ 
  content, 
  editable = false, 
  className = "",
  maxHeight = "none",
}: RichTextDisplayProps) {
  const editor = useEditor({
    extensions: editorExtensions,
    content: content,
    editable: editable,
    immediatelyRender: false,
  })

  if (!editor) {
    return null
  }

  return (
    <div className={`rich-text-display ${className}`}>
      <EditorContent 
        editor={editor} 
        className="prose prose-sm max-w-none"
        style={{ maxHeight, overflow: 'auto' }}
      />
    </div>
  )
}

// Simple HTML renderer for cases where you just want to display HTML without TipTap
export function SimpleHtmlDisplay({ 
  content, 
  className = "",
  maxHeight = "none" 
}: { 
  content: string
  className?: string
  maxHeight?: string 
}) {
  return (
    <div 
      className={`simple-html-display prose prose-sm max-w-none ${className}`}
      style={{ maxHeight, overflow: 'auto' }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  )
} 
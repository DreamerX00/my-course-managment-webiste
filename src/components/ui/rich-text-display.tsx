"use client";

import React from "react";
import { MarkdownDisplay } from "@/components/ui/markdown-display";

interface RichTextDisplayProps {
  content: string;
  editable?: boolean;
  className?: string;
  maxHeight?: string;
}

export function RichTextDisplay({
  content,
  editable = false,
  className = "",
  maxHeight = "none",
}: RichTextDisplayProps) {
  // Note: editable prop is deprecated - use ToastEditor directly for editable content
  if (editable) {
    console.warn(
      "RichTextDisplay: editable prop is deprecated. Use ToastEditor component for editable content."
    );
  }

  return (
    <div
      className={`rich-text-display ${className}`}
      style={{ maxHeight, overflow: "auto" }}
    >
      <MarkdownDisplay content={content} />
    </div>
  );
}

// Simple HTML renderer for cases where you just want to display HTML without TipTap
export function SimpleHtmlDisplay({
  content,
  className = "",
  maxHeight = "none",
}: {
  content: string;
  className?: string;
  maxHeight?: string;
}) {
  return (
    <div
      className={`simple-html-display prose prose-sm max-w-none ${className}`}
      style={{ maxHeight, overflow: "auto" }}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}

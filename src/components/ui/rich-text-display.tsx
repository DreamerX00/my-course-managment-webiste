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

// SECURITY: SimpleHtmlDisplay removed due to XSS vulnerability with dangerouslySetInnerHTML
// If HTML rendering is needed in the future, use DOMPurify for sanitization:
// import DOMPurify from 'dompurify';
// const clean = DOMPurify.sanitize(content);

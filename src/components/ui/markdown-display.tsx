"use client";

import React, { useEffect, useRef, useState } from "react";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import type { default as ViewerType } from "@toast-ui/editor/dist/toastui-editor-viewer";
import { useToastUIHighlightCopy } from "@/components/ui/toastui-highlight-copy";

interface MarkdownDisplayProps {
  content: string;
  className?: string;
}

export function MarkdownDisplay({
  content,
  className = "",
}: Readonly<MarkdownDisplayProps>) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewerInstance, setViewerInstance] = useState<ViewerType | null>(null);

  useEffect(() => {
    if (
      globalThis.window !== undefined &&
      viewerRef.current &&
      !viewerInstance
    ) {
      import("@toast-ui/editor/dist/toastui-editor-viewer").then((module) => {
        const Viewer = module.default;

        const viewer = new Viewer({
          el: viewerRef.current!,
          initialValue: content || "",
        });

        setViewerInstance(viewer);
      });
    }

    return () => {
      if (viewerInstance) {
        viewerInstance.destroy();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update content when prop changes
  useEffect(() => {
    if (viewerInstance && content) {
      viewerInstance.setMarkdown(content);
    }
  }, [content, viewerInstance]);

  // Add id attributes to headings after render for anchor navigation
  useEffect(() => {
    if (!viewerRef.current) return;
    const headings = viewerRef.current.querySelectorAll("h1, h2");
    for (const el of headings) {
      const text = el.textContent || "";
      const id = text.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
      el.setAttribute("id", id);
    }
  }, [content, viewerInstance]);

  useToastUIHighlightCopy(viewerRef);

  return (
    <div
      className={`markdown-display ${className} prose prose-lg dark:prose-invert max-w-3xl mx-auto`}
    >
      <div ref={viewerRef} className="toastui-editor-contents" />
    </div>
  );
}

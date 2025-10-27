"use client";

import React, { useEffect, useRef, useState } from "react";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import type { default as ViewerType } from "@toast-ui/editor/dist/toastui-editor-viewer";

interface MarkdownDisplayProps {
  content: string;
  className?: string;
}

export function MarkdownDisplay({
  content,
  className = "",
}: MarkdownDisplayProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const [viewerInstance, setViewerInstance] = useState<ViewerType | null>(null);

  useEffect(() => {
    if (
      typeof globalThis.window !== "undefined" &&
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

  return (
    <div className={`markdown-display ${className}`}>
      <div ref={viewerRef} className="toastui-editor-contents" />
    </div>
  );
}

"use client";

import { useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import type Editor from "@toast-ui/editor";

export interface ToastEditorProps {
  content?: string;
  onSave?: (content: { markdown: string; html: string }) => void;
  height?: string;
  theme?: "light" | "dark";
  placeholder?: string;
}

export interface ToastEditorHandle {
  setContent: (content: string) => void;
  getMarkdown: () => string;
  getHTML: () => string;
}

export const ToastEditor = forwardRef<ToastEditorHandle, ToastEditorProps>(
  function ToastEditor(
    {
      content = "",
      onSave,
      height = "400px",
      theme = "dark",
      placeholder = "Start typing...",
    },
    ref
  ) {
    const editorRef = useRef<HTMLDivElement>(null);
    const editorInstanceRef = useRef<Editor | null>(null);

    useEffect(() => {
      if (
        globalThis.window !== undefined &&
        editorRef.current &&
        !editorInstanceRef.current
      ) {
        import("@toast-ui/editor").then((module) => {
          const Editor = module.default;

          const editor = new Editor({
            el: editorRef.current!,
            height,
            initialEditType: "markdown",
            previewStyle: "vertical",
            theme,
            usageStatistics: false,
            initialValue: content,
            placeholder,
            hooks: {
              addImageBlobHook: async (
                blob: Blob,
                callback: (url: string, altText: string) => void
              ) => {
                // Create a local URL for the image
                const url = URL.createObjectURL(blob);
                callback(url, "Image");
              },
            },
            events: {
              change: () => {
                if (onSave && editorInstanceRef.current) {
                  const markdown = editorInstanceRef.current.getMarkdown();
                  const html = editorInstanceRef.current.getHTML();
                  onSave({ markdown, html });
                }
              },
            },
          });

          editorInstanceRef.current = editor;
        });
      }

      return () => {
        if (editorInstanceRef.current) {
          editorInstanceRef.current.destroy();
          editorInstanceRef.current = null;
        }
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update content when prop changes
    useEffect(() => {
      if (
        editorInstanceRef.current &&
        content !== editorInstanceRef.current.getMarkdown()
      ) {
        editorInstanceRef.current.setMarkdown(content);
      }
    }, [content]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      setContent: (newContent: string) => {
        if (editorInstanceRef.current) {
          editorInstanceRef.current.setMarkdown(newContent);
        }
      },
      getMarkdown: () => {
        return editorInstanceRef.current
          ? editorInstanceRef.current.getMarkdown()
          : "";
      },
      getHTML: () => {
        return editorInstanceRef.current
          ? editorInstanceRef.current.getHTML()
          : "";
      },
    }));

    return (
      <div className="toast-editor-wrapper">
        <div ref={editorRef} />
      </div>
    );
  }
);

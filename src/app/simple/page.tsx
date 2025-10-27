"use client";

import { useRef } from "react";
import { ToastEditor, ToastEditorHandle } from "@/components/ui/toast-editor";

export default function Page() {
  const editorRef = useRef<ToastEditorHandle>(null);

  const handleSave = ({ markdown }: { markdown: string }) => {
    // Log only in development
    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console
      console.log("Saved markdown:", markdown);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Simple Editor Test</h1>
      <ToastEditor
        ref={editorRef}
        height="600px"
        placeholder="Start writing..."
        onSave={handleSave}
      />
    </div>
  );
}

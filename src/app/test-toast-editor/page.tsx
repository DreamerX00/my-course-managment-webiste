"use client";

import { useRef, useEffect, useState } from "react";
import "@toast-ui/editor/dist/toastui-editor.css";
import "@toast-ui/editor/dist/theme/toastui-editor-dark.css";
import type Editor from "@toast-ui/editor";

export default function TestToastEditorPage() {
  const editorRef = useRef<HTMLDivElement>(null);
  const [content, setContent] = useState("");
  const [editorInstance, setEditorInstance] = useState<Editor | null>(null);
  const [previewMode, setPreviewMode] = useState<"vertical" | "tab">(
    "vertical"
  );

  useEffect(() => {
    if (
      typeof globalThis.window !== "undefined" &&
      editorRef.current &&
      !editorInstance
    ) {
      import("@toast-ui/editor").then((module) => {
        const Editor = module.default;

        const editor = new Editor({
          el: editorRef.current!,
          height: "600px",
          initialEditType: "markdown",
          previewStyle: "vertical",
          theme: "dark",
          usageStatistics: false,
          initialValue: `# Welcome to Toast UI Editor! 🎉

## Features

### Markdown Support
- **Bold text** and *italic text*
- ~~Strikethrough~~
- \`inline code\`

### Lists
1. First item
2. Second item
3. Third item

- Bullet point 1
- Bullet point 2

### Task Lists
- [x] Completed task
- [ ] Pending task

### Code Blocks
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

### Tables
| Feature | TipTap | Toast UI |
|---------|--------|----------|
| Markdown | ⚠️ Custom | ✅ Native |
| Tables | ✅ Yes | ✅ Yes |
| Dark Theme | ⚠️ Custom | ✅ Built-in |

### Links
[Visit GitHub](https://github.com)

### Blockquotes
> This is a blockquote
> It can span multiple lines

### Images
![Alt text](https://via.placeholder.com/300x200)

## Try It Out!
Copy and paste any Markdown content here - it just works! 🚀
`,
          hooks: {
            addImageBlobHook: async (
              blob: Blob,
              callback: (url: string, altText: string) => void
            ) => {
              // You can implement custom image upload logic here
              const url = URL.createObjectURL(blob);
              callback(url, "Image");
            },
          },
        });

        setEditorInstance(editor);
      });
    }

    return () => {
      if (editorInstance) {
        editorInstance.destroy();
      }
    };
  }, [editorInstance]);

  const handleGetContent = () => {
    if (editorInstance) {
      const markdown = editorInstance.getMarkdown();
      const html = editorInstance.getHTML();
      setContent(`Markdown:\n${markdown}\n\nHTML:\n${html}`);
    }
  };

  const handleSwitchMode = () => {
    if (editorInstance) {
      const currentMode = editorInstance.getCurrentPreviewStyle();
      const newMode = currentMode === "vertical" ? "tab" : "vertical";
      editorInstance.changePreviewStyle(newMode);
      setPreviewMode(newMode);
    }
  };

  const handleTogglePreview = () => {
    if (editorInstance) {
      const currentMode = previewMode;
      if (currentMode === "vertical") {
        // Switch to tab mode (preview hidden by default)
        editorInstance.changePreviewStyle("tab");
        setPreviewMode("tab");
      } else {
        // Switch back to vertical mode (preview visible)
        editorInstance.changePreviewStyle("vertical");
        setPreviewMode("vertical");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-white mb-2">
            Toast UI Editor Demo
          </h1>
          <p className="text-gray-400">
            A full-featured Markdown editor with WYSIWYG support
          </p>
        </div>

        <div className="flex gap-4 mb-4">
          <button
            onClick={handleGetContent}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Content
          </button>
          <button
            onClick={handleTogglePreview}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {previewMode === "vertical" ? "Hide Preview" : "Show Preview"}
          </button>
          <button
            onClick={handleSwitchMode}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Switch Preview Mode
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-xl overflow-hidden mb-6">
          <div ref={editorRef} />
        </div>

        {content && (
          <div className="bg-gray-800 rounded-lg p-4">
            <h2 className="text-xl font-bold text-white mb-2">
              Editor Content:
            </h2>
            <pre className="text-gray-300 text-sm overflow-auto max-h-96 whitespace-pre-wrap">
              {content}
            </pre>
          </div>
        )}

        <div className="mt-8 bg-gray-800 rounded-lg p-6 text-gray-300">
          <h2 className="text-2xl font-bold text-white mb-4">Key Features:</h2>
          <ul className="space-y-2">
            <li>
              ✅ <strong>Native Markdown support</strong> - No conversion needed
            </li>
            <li>
              ✅ <strong>WYSIWYG + Markdown mode</strong> - Switch between modes
            </li>
            <li>
              ✅ <strong>Split view</strong> - See Markdown and preview
              side-by-side
            </li>
            <li>
              ✅ <strong>Dark theme</strong> - Built-in dark mode
            </li>
            <li>
              ✅ <strong>GFM support</strong> - Tables, task lists,
              strikethrough
            </li>
            <li>
              ✅ <strong>Image upload</strong> - Drag & drop or paste images
            </li>
            <li>
              ✅ <strong>Syntax highlighting</strong> - Code blocks with
              highlighting
            </li>
            <li>
              ✅ <strong>Copy/Paste Markdown</strong> - Just works!
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

import { useEffect } from "react";

export function useToastUIHighlightCopy(
  viewerRef: React.RefObject<HTMLDivElement | null>
) {
  useEffect(() => {
    if (!viewerRef.current) return;
    // Highlight.js is already included by Toast UI, but we can add copy buttons
    const codeBlocks = viewerRef.current.querySelectorAll("pre code");
    for (const block of codeBlocks) {
      // Avoid duplicate copy buttons
      if (block.parentElement?.querySelector(".copy-btn")) continue;
      const btn = document.createElement("button");
      btn.textContent = "Copy";
      btn.className =
        "copy-btn absolute top-2 right-2 px-2 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 rounded shadow";
      btn.onclick = function () {
        navigator.clipboard.writeText(block.textContent || "");
        btn.textContent = "Copied!";
        setTimeout(function () {
          btn.textContent = "Copy";
        }, 1200);
      };
      block.parentElement?.classList.add("relative");
      block.parentElement?.appendChild(btn);
    }
  }, [viewerRef]);
}

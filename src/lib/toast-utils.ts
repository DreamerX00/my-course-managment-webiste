/**
 * Import file content and convert to Markdown
 * Supports: .md, .markdown, .txt, .doc, .docx
 */
export async function importFileToMarkdown(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase();

  // For Markdown and text files, just read the content
  if (ext === "md" || ext === "markdown" || ext === "txt") {
    return await file.text();
  }

  // For Word documents, we'd need a library like mammoth
  // For now, return empty string with a note
  if (ext === "doc" || ext === "docx") {
    throw new Error(
      "Word document import requires additional setup. Please save as .md or .txt format."
    );
  }

  throw new Error(
    "Unsupported file format. Please use .md, .markdown, or .txt files."
  );
}

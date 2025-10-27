"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import javascript from "highlight.js/lib/languages/javascript";
import xml from "highlight.js/lib/languages/xml";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import {
  SimpleEditor,
  SimpleEditorHandle,
} from "@/components/tiptap-templates/simple/simple-editor";
import { importFileToTiptapJSON } from "@/lib/tiptap-utils";

// If TypeScript still complains, add the following at the top or in a .d.ts file:
// declare module 'lowlight/lib/core';
// declare module 'highlight.js/lib/languages/javascript';
// declare module 'highlight.js/lib/languages/xml';

const lowlight = createLowlight(common);
lowlight.register("javascript", javascript);
lowlight.register("xml", xml);

interface Chapter {
  id: string;
  title: string;
  content: string;
  position: number;
  [key: string]: unknown;
}

interface Subchapter {
  id: string;
  title: string;
  content: string;
  position: number;
  chapterId: string;
  [key: string]: unknown;
}

export default function CourseContentManagerPage() {
  const params = useParams();
  const courseId = params.courseId as string;

  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [saving, setSaving] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newChapterContent, setNewChapterContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteChapterId, setDeleteChapterId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [reorderLoading, setReorderLoading] = useState(false);
  const [reorderError, setReorderError] = useState<string | null>(null);

  // Add subchapter state
  const [subchapters, setSubchapters] = useState<Subchapter[]>([]);
  const [selectedSubchapter, setSelectedSubchapter] =
    useState<Subchapter | null>(null);
  const [newSubTitle, setNewSubTitle] = useState("");
  const [newSubContent, setNewSubContent] = useState("");
  const [subCreating, setSubCreating] = useState(false);
  const [subCreateError, setSubCreateError] = useState<string | null>(null);
  const [deleteSubId, setDeleteSubId] = useState<string | null>(null);
  const [subDeleting, setSubDeleting] = useState(false);
  const [subDeleteError, setSubDeleteError] = useState<string | null>(null);
  const [subReorderLoading, setSubReorderLoading] = useState(false);
  const [subReorderError, setSubReorderError] = useState<string | null>(null);

  // Add expandedChapterId state
  const [expandedChapterId, setExpandedChapterId] = useState<string | null>(
    null
  );

  // Add state to hold pending content for chapter and subchapter
  const [pendingChapterContent, setPendingChapterContent] =
    useState<unknown>(null);
  const [pendingSubchapterContent, setPendingSubchapterContent] =
    useState<unknown>(null);

  // Add a ref to SimpleEditor to allow setting content
  const simpleEditorRef = React.useRef<SimpleEditorHandle | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const subChapterFileInputRef = React.useRef<HTMLInputElement>(null);

  // Fetch chapters for this course
  useEffect(() => {
    if (!courseId) return;
    fetch(`/api/courses/${courseId}/chapters`)
      .then((res) => res.json())
      .then((data) => {
        setChapters(data);
      })
      .catch((err) => {
        console.error("Failed to load chapters:", err);
      });
  }, [courseId]);

  // Fetch subchapters when selectedChapter changes
  useEffect(() => {
    if (!selectedChapter) return;
    fetch(`/api/courses/${courseId}/chapters/${selectedChapter.id}/subchapters`)
      .then((res) => res.json())
      .then((data) => {
        setSubchapters(data);
      })
      .catch((err) => {
        console.error("Failed to load subchapters:", err);
      });
  }, [selectedChapter, courseId]);

  // Tiptap editor instance
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: selectedChapter?.content || "<p>Edit chapter content here...</p>",
    onUpdate: () => {
      // Optionally handle live preview or autosave
    },
    editable: !!selectedChapter,
  });

  // Update editor content when chapter changes
  useEffect(() => {
    if (editor && selectedChapter) {
      editor.commands.setContent(
        selectedChapter.content || "<p>Edit chapter content here...</p>"
      );
    }
  }, [selectedChapter, editor]);

  // Save chapter content
  const handleSave = async () => {
    if (!selectedChapter || !pendingChapterContent) {
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(
        `/api/courses/${courseId}/chapters/${selectedChapter.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: JSON.stringify(pendingChapterContent),
          }),
        }
      );

      if (!res.ok) {
        const errorData = await res
          .json()
          .catch(() => ({ error: "Failed to parse error response" }));
        console.error("Chapter save failed:", errorData);
        throw new Error(errorData.error || "Failed to save chapter");
      }

      const updated = await res.json();
      setChapters((prev) =>
        prev.map((ch) => (ch.id === updated.id ? updated : ch))
      );
      setPendingChapterContent(null);
    } catch (err: unknown) {
      console.error("An error occurred during chapter save:", err);
    } finally {
      setSaving(false);
    }
  };

  // Create new chapter
  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !newChapterTitle || !newChapterContent) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newChapterTitle,
          content: newChapterContent,
        }),
      });
      if (!res.ok) throw new Error("Failed to create chapter");
      const created = await res.json();
      setChapters((prev) => [...prev, created]);
      setNewChapterTitle("");
      setNewChapterContent("");
      setSelectedChapter(created);
    } catch {
      setCreateError("Failed to create chapter");
    } finally {
      setCreating(false);
    }
  };

  // Delete chapter
  const handleDeleteChapter = async (chapterId: string) => {
    if (!courseId || !chapterId) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(
        `/api/courses/${courseId}/chapters/${chapterId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete chapter");
      setChapters((prev) => prev.filter((ch) => ch.id !== chapterId));
      if (selectedChapter?.id === chapterId) setSelectedChapter(null);
      setDeleteChapterId(null);
    } catch {
      setDeleteError("Failed to delete chapter");
    } finally {
      setDeleting(false);
    }
  };

  // Handle drag end for chapter reordering
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination || !courseId) return;
    const reordered = Array.from(chapters);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setChapters(reordered);
    setReorderLoading(true);
    setReorderError(null);
    try {
      const chapterIds = reordered.map((ch) => ch.id);
      const res = await fetch(`/api/courses/${courseId}/chapters/reorder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterIds }),
      });
      if (!res.ok) throw new Error("Failed to reorder chapters");
    } catch {
      setReorderError("Failed to save chapter order");
    } finally {
      setReorderLoading(false);
    }
  };

  // Create new subchapter
  const handleCreateSubchapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChapter || !newSubTitle || !newSubContent) return;
    setSubCreating(true);
    setSubCreateError(null);
    try {
      const res = await fetch(
        `/api/courses/${courseId}/chapters/${selectedChapter.id}/subchapters`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newSubTitle, content: newSubContent }),
        }
      );
      if (!res.ok) throw new Error("Failed to create subchapter");
      const created = await res.json();
      setSubchapters((prev) => [...prev, created]);
      setNewSubTitle("");
      setNewSubContent("");
      setSelectedSubchapter(created);
    } catch {
      setSubCreateError("Failed to create subchapter");
    } finally {
      setSubCreating(false);
    }
  };

  // Delete subchapter
  const handleDeleteSubchapter = async (subId: string) => {
    if (!selectedChapter || !subId) return;
    setSubDeleting(true);
    setSubDeleteError(null);
    try {
      const res = await fetch(
        `/api/courses/${courseId}/chapters/${selectedChapter.id}/subchapters/${subId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Failed to delete subchapter");
      setSubchapters((prev) => prev.filter((sc) => sc.id !== subId));
      if (selectedSubchapter?.id === subId) setSelectedSubchapter(null);
      setDeleteSubId(null);
    } catch {
      setSubDeleteError("Failed to delete subchapter");
    } finally {
      setSubDeleting(false);
    }
  };

  // Drag-and-drop reordering for subchapters
  const handleSubDragEnd = async (result: DropResult) => {
    if (!result.destination || !selectedChapter) return;
    const reordered = Array.from(subchapters);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setSubchapters(reordered);
    setSubReorderLoading(true);
    setSubReorderError(null);
    try {
      const subIds = reordered.map((sc) => sc.id);
      // You need to implement this API route
      const res = await fetch(
        `/api/courses/${courseId}/chapters/${selectedChapter.id}/subchapters/reorder`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subchapterIds: subIds }),
        }
      );
      if (!res.ok) throw new Error("Failed to reorder subchapters");
    } catch {
      setSubReorderError("Failed to save subchapter order");
    } finally {
      setSubReorderLoading(false);
    }
  };

  const subEditor = useEditor({
    extensions: [
      StarterKit,
      Link,
      Image,
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content:
      selectedSubchapter?.content || "<p>Edit subchapter content here...</p>",
    editable: !!selectedSubchapter,
  });

  // Update subEditor content when subchapter changes
  useEffect(() => {
    if (subEditor && selectedSubchapter) {
      subEditor.commands.setContent(
        selectedSubchapter.content || "<p>Edit subchapter content here...</p>"
      );
    }
  }, [selectedSubchapter, subEditor]);

  // Update handleSaveSubchapter to save JSON
  const handleSaveSubchapter = async () => {
    if (!selectedSubchapter || !pendingSubchapterContent) {
      return;
    }
    setSaving(true);
    try {
      if (!selectedChapter) {
        throw new Error("No chapter selected");
      }
      const res = await fetch(
        `/api/courses/${courseId}/chapters/${selectedChapter.id}/subchapters/${selectedSubchapter.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: JSON.stringify(pendingSubchapterContent),
          }),
        }
      );
      if (!res.ok) throw new Error("Failed to save subchapter");
      // Refresh subchapters list
      const updated = await res.json();
      setSubchapters((prev) =>
        prev.map((sc) => (sc.id === updated.id ? updated : sc))
      );
    } catch (err: unknown) {
      console.error("Failed to save subchapter:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !selectedChapter) return;

    try {
      const jsonContent = await importFileToTiptapJSON(file);
      setPendingChapterContent(jsonContent);
      // Optionally, update the editor view immediately
      simpleEditorRef.current?.setContent(jsonContent);
    } catch (error: unknown) {
      console.error("Failed to import file:", error);
    } finally {
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubchapterFileImport = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !selectedSubchapter) return;

    try {
      const jsonContent = await importFileToTiptapJSON(file);
      setPendingSubchapterContent(jsonContent);
      // Optionally, update the editor view immediately
      simpleEditorRef.current?.setContent(jsonContent);
    } catch (error: unknown) {
      console.error("Failed to import file:", error);
    } finally {
      // Reset file input
      if (subChapterFileInputRef.current) {
        subChapterFileInputRef.current.value = "";
      }
    }
  };

  if (!courseId) {
    return <div className="p-8 text-center">Loading course...</div>;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-yellow-50 to-pink-50 p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-lg p-8 flex flex-col gap-8">
        {/* Sidebar: Chapter List */}
        <div className="w-full">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Chapters</h2>
          {/* New Chapter Form */}
          <form
            onSubmit={handleCreateChapter}
            className="mb-6 space-y-2 bg-blue-50 p-3 rounded-lg border border-blue-100"
          >
            <input
              className="w-full border border-black rounded px-2 py-1 text-gray-900 font-bold placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="New Chapter Title"
              value={newChapterTitle}
              onChange={(e) => setNewChapterTitle(e.target.value)}
              required
              disabled={creating}
            />
            <textarea
              className="w-full border border-black rounded px-2 py-1 text-gray-900 font-bold placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Initial Content"
              value={newChapterContent}
              onChange={(e) => setNewChapterContent(e.target.value)}
              required
              disabled={creating}
            />
            {createError && (
              <div className="text-red-700 font-bold">{createError}</div>
            )}
            <button
              type="submit"
              className="px-3 py-1 bg-blue-700 text-white rounded font-semibold w-full"
              disabled={creating || !newChapterTitle || !newChapterContent}
            >
              {creating ? "Creating..." : "Add Chapter"}
            </button>
          </form>
          {/* Chapter List with Drag and Drop */}
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="chapter-list">
              {(provided) => (
                <ul
                  className="space-y-2"
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                >
                  {chapters.map((chapter, index) => (
                    <Draggable
                      key={chapter.id}
                      draggableId={chapter.id}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <li
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`flex items-center gap-2 bg-white relative ${
                            snapshot.isDragging ? "ring-2 ring-blue-400" : ""
                          }`}
                        >
                          {/* Drag handle */}
                          <span
                            {...provided.dragHandleProps}
                            className="cursor-grab px-2 text-gray-400 hover:text-blue-700 text-lg select-none"
                            title="Drag to reorder"
                          >
                            ≡
                          </span>
                          {/* Toggle arrow */}
                          <button
                            className="text-lg focus:outline-none px-1"
                            onClick={() =>
                              setExpandedChapterId(
                                expandedChapterId === chapter.id
                                  ? null
                                  : chapter.id
                              )
                            }
                            aria-label={
                              expandedChapterId === chapter.id
                                ? "Collapse"
                                : "Expand"
                            }
                          >
                            {expandedChapterId === chapter.id ? "▼" : "▶"}
                          </button>
                          <button
                            className={`flex-1 text-left px-3 py-2 rounded font-semibold ${
                              selectedChapter?.id === chapter.id
                                ? "bg-blue-100 text-blue-900"
                                : "bg-gray-100 text-gray-800"
                            }`}
                            onClick={() => setSelectedChapter(chapter)}
                          >
                            {chapter.title}
                          </button>
                          <button
                            className="px-2 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 ml-2"
                            onClick={() => setDeleteChapterId(chapter.id)}
                            disabled={deleting}
                          >
                            Delete
                          </button>
                          {/* Delete confirmation dialog */}
                          {deleteChapterId === chapter.id && (
                            <div className="absolute z-20 left-0 top-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30">
                              <div className="bg-white border border-red-300 rounded p-4 flex flex-col gap-2 shadow-lg">
                                <span className="text-sm text-red-700">
                                  Are you sure you want to delete this chapter?
                                </span>
                                {deleteError && (
                                  <div className="text-red-700 text-xs">
                                    {deleteError}
                                  </div>
                                )}
                                <div className="flex gap-2">
                                  <button
                                    className="px-3 py-1 bg-gray-300 text-gray-800 rounded font-semibold"
                                    onClick={() => setDeleteChapterId(null)}
                                    disabled={deleting}
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    className="px-3 py-1 bg-red-700 text-white rounded font-semibold"
                                    onClick={() =>
                                      handleDeleteChapter(chapter.id)
                                    }
                                    disabled={deleting}
                                  >
                                    {deleting ? "Deleting..." : "Delete"}
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
          {reorderLoading && (
            <div className="text-blue-700 mt-2">Saving order...</div>
          )}
          {reorderError && (
            <div className="text-red-700 mt-2">{reorderError}</div>
          )}
          {/* Only show subchapters if expandedChapterId === chapter.id */}
          {expandedChapterId === selectedChapter?.id && selectedChapter && (
            <div className="mt-6">
              <h3 className="text-lg font-bold text-blue-800 mb-2">
                Subchapters
              </h3>
              <form
                onSubmit={handleCreateSubchapter}
                className="mb-4 space-y-2 bg-blue-50 p-2 rounded-lg border border-blue-100"
              >
                <input
                  className="w-full border border-black rounded px-2 py-1 text-gray-900 font-bold placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="New Subchapter Title"
                  value={newSubTitle}
                  onChange={(e) => setNewSubTitle(e.target.value)}
                  required
                  disabled={subCreating}
                />
                <textarea
                  className="w-full border border-black rounded px-2 py-1 text-gray-900 font-bold placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Initial Content"
                  value={newSubContent}
                  onChange={(e) => setNewSubContent(e.target.value)}
                  required
                  disabled={subCreating}
                />
                {subCreateError && (
                  <div className="text-red-700 font-bold">{subCreateError}</div>
                )}
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-700 text-white rounded font-semibold w-full"
                  disabled={subCreating || !newSubTitle || !newSubContent}
                >
                  {subCreating ? "Creating..." : "Add Subchapter"}
                </button>
              </form>
              <DragDropContext onDragEnd={handleSubDragEnd}>
                <Droppable droppableId="subchapter-list">
                  {(provided) => (
                    <ul
                      className="space-y-1"
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                    >
                      {subchapters.map((sub, idx) => (
                        <Draggable
                          key={sub.id}
                          draggableId={sub.id}
                          index={idx}
                        >
                          {(provided, snapshot) => (
                            <li
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`flex items-center gap-2 bg-white relative ${
                                snapshot.isDragging
                                  ? "ring-2 ring-blue-400"
                                  : ""
                              }`}
                            >
                              <span
                                {...provided.dragHandleProps}
                                className="cursor-grab px-2 text-gray-400 hover:text-blue-700 text-lg select-none"
                                title="Drag to reorder"
                              >
                                ≡
                              </span>
                              <button
                                className={`flex-1 text-left px-2 py-1 rounded font-semibold ${
                                  selectedSubchapter?.id === sub.id
                                    ? "bg-blue-50 text-blue-900"
                                    : "bg-gray-50 text-gray-800"
                                }`}
                                onClick={() => setSelectedSubchapter(sub)}
                              >
                                {sub.title}
                              </button>
                              <button
                                className="px-2 py-1 bg-red-600 text-white rounded text-xs font-semibold hover:bg-red-700 ml-2"
                                onClick={() => setDeleteSubId(sub.id)}
                                disabled={subDeleting}
                              >
                                Delete
                              </button>
                              {deleteSubId === sub.id && (
                                <div className="absolute z-20 left-0 top-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30">
                                  <div className="bg-white border border-red-300 rounded p-4 flex flex-col gap-2 shadow-lg">
                                    <span className="text-sm text-red-700">
                                      Are you sure you want to delete this
                                      subchapter?
                                    </span>
                                    {subDeleteError && (
                                      <div className="text-red-700 text-xs">
                                        {subDeleteError}
                                      </div>
                                    )}
                                    <div className="flex gap-2">
                                      <button
                                        className="px-3 py-1 bg-gray-300 text-gray-800 rounded font-semibold"
                                        onClick={() => setDeleteSubId(null)}
                                        disabled={subDeleting}
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        className="px-3 py-1 bg-red-700 text-white rounded font-semibold"
                                        onClick={() =>
                                          handleDeleteSubchapter(sub.id)
                                        }
                                        disabled={subDeleting}
                                      >
                                        {subDeleting ? "Deleting..." : "Delete"}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </li>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </ul>
                  )}
                </Droppable>
              </DragDropContext>
              {subReorderLoading && (
                <div className="text-blue-700 mt-2">
                  Saving subchapter order...
                </div>
              )}
              {subReorderError && (
                <div className="text-red-700 mt-2">{subReorderError}</div>
              )}
            </div>
          )}
        </div>
        {/* Main: Tiptap Editor */}
        <div className="w-full">
          {selectedChapter && (
            <>
              <div className="grow flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Chapter Content
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-semibold border border-gray-300 hover:bg-gray-200 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      Import
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      onChange={handleFileImport}
                      accept=".md,.markdown,.txt,.doc,.docx"
                    />
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden grow">
                  <SimpleEditor
                    ref={simpleEditorRef}
                    content={parseContent(selectedChapter.content)}
                    onSave={setPendingChapterContent}
                  />
                </div>
              </div>
            </>
          )}
          {selectedSubchapter && (
            <>
              <div className="grow flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Subchapter Content
                  </h3>
                  <div className="flex items-center gap-2">
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
                      onClick={handleSaveSubchapter}
                      disabled={saving}
                    >
                      {saving ? "Saving..." : "Save"}
                    </button>
                    <button
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg font-semibold border border-gray-300 hover:bg-gray-200 transition-colors"
                      onClick={() => subChapterFileInputRef.current?.click()}
                    >
                      Import
                    </button>
                    <input
                      type="file"
                      ref={subChapterFileInputRef}
                      className="hidden"
                      onChange={handleSubchapterFileImport}
                      accept=".md,.markdown,.txt,.doc,.docx"
                    />
                  </div>
                </div>
                <div className="border rounded-lg overflow-hidden grow">
                  <SimpleEditor
                    ref={simpleEditorRef}
                    content={parseContent(selectedSubchapter.content)}
                    onSave={setPendingSubchapterContent}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Add this utility function at the top or near the handlers
function parseContent(content: unknown): unknown {
  if (!content) return undefined;
  if (typeof content === "string") {
    try {
      return JSON.parse(content);
    } catch {
      // fallback for legacy HTML string content
      return content;
    }
  }
  return content;
}

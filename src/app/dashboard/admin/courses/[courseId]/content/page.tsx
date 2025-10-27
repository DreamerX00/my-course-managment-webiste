"use client";
import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { ToastEditor, ToastEditorHandle } from "@/components/ui/toast-editor";
import { importFileToMarkdown } from "@/lib/toast-utils";
import { useToast } from "@/components/ui/use-toast";

interface Chapter {
  id: string;
  title: string;
  content: string;
  videoUrl?: string | null;
  position: number;
  [key: string]: unknown;
}

interface Subchapter {
  id: string;
  title: string;
  content: string;
  videoUrl?: string | null;
  position: number;
  chapterId: string;
  [key: string]: unknown;
}

export default function CourseContentManagerPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const { toast } = useToast();

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

  // Add state for video URLs
  const [chapterVideoUrl, setChapterVideoUrl] = useState<string>("");
  const [subchapterVideoUrl, setSubchapterVideoUrl] = useState<string>("");

  // Add a ref to ToastEditor to allow setting content
  const editorRef = React.useRef<ToastEditorHandle | null>(null);

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
        toast({
          title: "Error",
          description: "Failed to load chapters. Please refresh the page.",
          variant: "destructive",
        });
      });
  }, [courseId, toast]);

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
        toast({
          title: "Error",
          description: "Failed to load subchapters. Please try again.",
          variant: "destructive",
        });
      });
  }, [selectedChapter, courseId, toast]);

  // Update video URL when chapter/subchapter changes
  useEffect(() => {
    if (selectedChapter && !selectedSubchapter) {
      setChapterVideoUrl(selectedChapter.videoUrl || "");
    }
  }, [selectedChapter, selectedSubchapter]);

  useEffect(() => {
    if (selectedSubchapter) {
      setSubchapterVideoUrl(selectedSubchapter.videoUrl || "");
    }
  }, [selectedSubchapter]);

  // Save chapter content
  const handleSave = async () => {
    if (!selectedChapter) {
      toast({
        title: "Warning",
        description: "No chapter selected.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      const updateData: { content?: string; videoUrl?: string } = {};

      if (pendingChapterContent) {
        updateData.content = JSON.stringify(pendingChapterContent);
      }

      // Always include videoUrl (even if empty string to clear it)
      updateData.videoUrl = chapterVideoUrl || undefined;

      const res = await fetch(
        `/api/courses/${courseId}/chapters/${selectedChapter.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
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

      toast({
        title: "Success",
        description: "Chapter content saved successfully!",
      });
    } catch (err: unknown) {
      console.error("An error occurred during chapter save:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : "Failed to save chapter content.",
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: `Chapter "${created.title}" created successfully!`,
      });
    } catch {
      setCreateError("Failed to create chapter");
      toast({
        title: "Error",
        description: "Failed to create chapter. Please try again.",
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: "Chapter deleted successfully!",
      });
    } catch {
      setDeleteError("Failed to delete chapter");
      toast({
        title: "Error",
        description: "Failed to delete chapter. Please try again.",
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: "Chapter order updated successfully!",
      });
    } catch {
      setReorderError("Failed to save chapter order");
      toast({
        title: "Error",
        description: "Failed to save chapter order. Please try again.",
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: `Subchapter "${created.title}" created successfully!`,
      });
    } catch {
      setSubCreateError("Failed to create subchapter");
      toast({
        title: "Error",
        description: "Failed to create subchapter. Please try again.",
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: "Subchapter deleted successfully!",
      });
    } catch {
      setSubDeleteError("Failed to delete subchapter");
      toast({
        title: "Error",
        description: "Failed to delete subchapter. Please try again.",
        variant: "destructive",
      });
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

      toast({
        title: "Success",
        description: "Subchapter order updated successfully!",
      });
    } catch {
      setSubReorderError("Failed to save subchapter order");
      toast({
        title: "Error",
        description: "Failed to save subchapter order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubReorderLoading(false);
    }
  };

  // Update handleSaveSubchapter to save JSON
  const handleSaveSubchapter = async () => {
    if (!selectedSubchapter) {
      toast({
        title: "Warning",
        description: "No subchapter selected.",
        variant: "destructive",
      });
      return;
    }
    setSaving(true);
    try {
      if (!selectedChapter) {
        throw new Error("No chapter selected");
      }

      const updateData: { content?: string; videoUrl?: string } = {};

      if (pendingSubchapterContent) {
        updateData.content = JSON.stringify(pendingSubchapterContent);
      }

      // Always include videoUrl (even if empty string to clear it)
      updateData.videoUrl = subchapterVideoUrl || undefined;
      const res = await fetch(
        `/api/courses/${courseId}/chapters/${selectedChapter.id}/subchapters/${selectedSubchapter.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        }
      );
      if (!res.ok) throw new Error("Failed to save subchapter");
      // Refresh subchapters list
      const updated = await res.json();
      setSubchapters((prev) =>
        prev.map((sc) => (sc.id === updated.id ? updated : sc))
      );

      toast({
        title: "Success",
        description: "Subchapter content saved successfully!",
      });
    } catch (err: unknown) {
      console.error("Failed to save subchapter:", err);
      toast({
        title: "Error",
        description:
          err instanceof Error
            ? err.message
            : "Failed to save subchapter content.",
        variant: "destructive",
      });
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
      const markdownContent = await importFileToMarkdown(file);
      setPendingChapterContent(markdownContent);
      // Update the editor view immediately
      editorRef.current?.setContent(markdownContent);

      toast({
        title: "Success",
        description: `File "${file.name}" imported successfully!`,
      });
    } catch (error: unknown) {
      console.error("Failed to import file:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to import file. Please ensure it's a valid format.",
        variant: "destructive",
      });
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
      const markdownContent = await importFileToMarkdown(file);
      setPendingSubchapterContent(markdownContent);
      // Update the editor view immediately
      editorRef.current?.setContent(markdownContent);

      toast({
        title: "Success",
        description: `File "${file.name}" imported successfully!`,
      });
    } catch (error: unknown) {
      console.error("Failed to import file:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to import file. Please ensure it's a valid format.",
        variant: "destructive",
      });
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
                            onClick={() => {
                              setSelectedChapter(chapter);
                              setSelectedSubchapter(null); // Clear subchapter when selecting chapter
                            }}
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
                                onClick={() => {
                                  setSelectedSubchapter(sub);
                                  // Keep the chapter selected to show subchapters, but editor will show subchapter
                                }}
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
          {!selectedChapter && !selectedSubchapter && (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <p>Select a chapter or subchapter to edit its content</p>
            </div>
          )}
          {selectedChapter && !selectedSubchapter && (
            <>
              <div className="grow flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">
                    Chapter Content: {selectedChapter.title}
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
                {/* Video URL input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video URL (MP4 or YouTube embed link)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                    value={chapterVideoUrl}
                    onChange={(e) => setChapterVideoUrl(e.target.value)}
                  />
                  <span className="text-xs text-gray-500">
                    Leave blank for no video. YouTube links must be embed URLs
                    (see docs).
                  </span>
                </div>
                <div className="border rounded-lg overflow-hidden grow bg-gray-900">
                  <ToastEditor
                    ref={editorRef}
                    content={parseContentToMarkdown(selectedChapter.content)}
                    onSave={(content) =>
                      setPendingChapterContent(content.markdown)
                    }
                    theme="dark"
                    height="600px"
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
                    Subchapter Content: {selectedSubchapter.title}
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
                {/* Video URL input for subchapter */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Video URL (MP4 or YouTube embed link)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-2 py-1 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                    value={subchapterVideoUrl}
                    onChange={(e) => setSubchapterVideoUrl(e.target.value)}
                  />
                  <span className="text-xs text-gray-500">
                    Leave blank for no video. YouTube links must be embed URLs
                    (see docs).
                  </span>
                </div>
                <div className="border rounded-lg overflow-hidden grow bg-gray-900">
                  <ToastEditor
                    ref={editorRef}
                    content={parseContentToMarkdown(selectedSubchapter.content)}
                    onSave={(content) =>
                      setPendingSubchapterContent(content.markdown)
                    }
                    theme="dark"
                    height="600px"
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
function parseContentToMarkdown(content: unknown): string {
  if (!content) return "";
  if (typeof content === "string") {
    // If it's already a string, assume it's Markdown or plain text
    return content;
  }
  // If it's JSON from TipTap, return empty for now (we'll handle migration separately)
  return "";
}

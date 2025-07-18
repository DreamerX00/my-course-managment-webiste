"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { RichTextDisplay } from "@/components/ui/rich-text-display";
import { EditorContent, useEditor } from '@tiptap/react';
import { editorExtensions } from '@/lib/tiptap-extensions';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnail?: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  color: string;
  order: number;
}

export default function AdminPanelPage() {
  const { data: session } = useSession();
  const userRole = session?.user?.role || "STUDENT";
  const isAdmin = ["ADMIN", "INSTRUCTOR", "OWNER"].includes(userRole);

  // State for courses
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for categories
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // State for new course form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number>(0);
  const [imageUrl, setImageUrl] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Add state for free toggle and delete confirmation
  const [isFree, setIsFree] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteInput, setDeleteInput] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Add state for expanded course content management
  const [expandedCourseId, setExpandedCourseId] = useState<string | null>(null);
  const [chapters, setChapters] = useState<{ [courseId: string]: any[] }>({});
  const [chapterTitle, setChapterTitle] = useState("");
  const [chapterContent, setChapterContent] = useState("");
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapterError, setChapterError] = useState<string | null>(null);

  // Add state for editing chapters
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);
  const [editChapterTitle, setEditChapterTitle] = useState("");
  const [editChapterContent, setEditChapterContent] = useState("");
  const [editChapterLoading, setEditChapterLoading] = useState(false);
  const [editChapterError, setEditChapterError] = useState<string | null>(null);
  const [deleteChapterId, setDeleteChapterId] = useState<string | null>(null);
  const [deleteChapterLoading, setDeleteChapterLoading] = useState(false);
  const [deleteChapterError, setDeleteChapterError] = useState<string | null>(null);

  // Add state for editing courses
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [editCourseTitle, setEditCourseTitle] = useState("");
  const [editCourseDescription, setEditCourseDescription] = useState("");
  const [editCoursePrice, setEditCoursePrice] = useState<number>(0);
  const [editCourseThumbnail, setEditCourseThumbnail] = useState("");
  const [editCourseCategory, setEditCourseCategory] = useState<string>("");
  const [editCoursePublished, setEditCoursePublished] = useState(false);
  const [editCourseLoading, setEditCourseLoading] = useState(false);
  const [editCourseError, setEditCourseError] = useState<string | null>(null);

  // TipTap editor for course description editing
  const editCourseEditor = useEditor({
    extensions: editorExtensions,
    content: editCourseDescription,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setEditCourseDescription(editor.getHTML());
    }
  });

  // Update editor content when description changes
  useEffect(() => {
    if (editCourseEditor) {
      editCourseEditor.commands.setContent(editCourseDescription);
    }
  }, [editCourseDescription, editCourseEditor]);

  // TipTap editor for course creation
  const createCourseEditor = useEditor({
    extensions: editorExtensions,
    content: description,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setDescription(editor.getHTML());
    }
  });

  // Update editor content when description changes
  useEffect(() => {
    if (createCourseEditor) {
      createCourseEditor.commands.setContent(description);
    }
  }, [description, createCourseEditor]);

  // Add state for publish loading and error
  const [publishLoadingId, setPublishLoadingId] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const router = useRouter();

  // Fetch categories from content settings
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesLoading(true);
        const response = await fetch('/api/content-settings', {
          cache: 'no-store' // Prevent caching
        });
        if (response.ok) {
          const data = await response.json();
          const filterCategories = data.filterCategories || [];
          console.log('Fetched categories:', filterCategories);
          setCategories(filterCategories);
        } else {
          console.error('Failed to fetch categories');
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();

    // Add focus event listener to refresh categories when page is focused
    const handleFocus = () => {
      console.log('Page focused, refreshing categories...');
      fetchCategories();
    };

    // Set up periodic refresh every 30 seconds
    const intervalId = setInterval(() => {
      console.log('Periodic category refresh...');
      fetchCategories();
    }, 30000);

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(intervalId);
    };
  }, []);

  // Function to refresh categories
  const refreshCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await fetch('/api/content-settings', {
        cache: 'no-store'
      });
      if (response.ok) {
        const data = await response.json();
        const filterCategories = data.filterCategories || [];
        console.log('Refreshed categories:', filterCategories);
        setCategories(filterCategories);
      } else {
        console.error('Failed to refresh categories');
      }
    } catch (error) {
      console.error('Error refreshing categories:', error);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    setLoading(true);
    fetch("/api/courses?all=true")
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load courses");
        setLoading(false);
      });
  }, [isAdmin]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          title, 
          description, 
          price, 
          imageUrl,
          category: selectedCategory 
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create course");
      }
      const newCourse = await res.json();
      setCourses([newCourse, ...courses]);
      setTitle("");
      setDescription("");
      setPrice(0);
      setImageUrl("");
      setSelectedCategory("");
    } catch (err: any) {
      setCreateError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (course: Course) => {
    setDeleting(true);
    setDeleteError(null);
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete course");
      }
      setCourses(courses.filter(c => c.id !== course.id));
      setDeleteId(null);
      setDeleteInput("");
    } catch (err: any) {
      setDeleteError(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Fetch chapters for a course
  const fetchChapters = async (courseId: string) => {
    setChapterLoading(true);
    setChapterError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/chapters`);
      const data = await res.json();
      setChapters((prev) => ({ ...prev, [courseId]: data }));
    } catch {
      setChapterError("Failed to load chapters");
    } finally {
      setChapterLoading(false);
    }
  };

  // Add chapter to a course
  const handleAddChapter = async (courseId: string) => {
    setChapterLoading(true);
    setChapterError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/chapters`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: chapterTitle, content: chapterContent }),
      });
      if (!res.ok) throw new Error("Failed to add chapter");
      setChapterTitle("");
      setChapterContent("");
      fetchChapters(courseId);
    } catch {
      setChapterError("Failed to add chapter");
    } finally {
      setChapterLoading(false);
    }
  };

  // Handler to start editing a chapter
  const handleStartEditChapter = (chapter: any) => {
    setEditingChapterId(chapter.id);
    setEditChapterTitle(chapter.title);
    setEditChapterContent(chapter.content);
    setEditChapterError(null);
  };

  // Handler to cancel editing
  const handleCancelEditChapter = () => {
    setEditingChapterId(null);
    setEditChapterTitle("");
    setEditChapterContent("");
    setEditChapterError(null);
  };

  // Handler to submit chapter edit
  const handleEditChapter = async (courseId: string, chapterId: string) => {
    setEditChapterLoading(true);
    setEditChapterError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editChapterTitle, content: editChapterContent }),
      });
      if (!res.ok) throw new Error("Failed to update chapter");
      setEditingChapterId(null);
      setEditChapterTitle("");
      setEditChapterContent("");
      fetchChapters(courseId);
    } catch {
      setEditChapterError("Failed to update chapter");
    } finally {
      setEditChapterLoading(false);
    }
  };

  // Handler to delete a chapter
  const handleDeleteChapter = async (courseId: string, chapterId: string) => {
    setDeleteChapterLoading(true);
    setDeleteChapterError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}/chapters/${chapterId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete chapter");
      setDeleteChapterId(null);
      fetchChapters(courseId);
    } catch {
      setDeleteChapterError("Failed to delete chapter");
    } finally {
      setDeleteChapterLoading(false);
    }
  };

  // Handler to start editing a course
  const handleStartEditCourse = async (course: Course) => {
    setEditingCourseId(course.id);
    setEditCourseTitle(course.title);
    setEditCourseDescription(course.description);
    setEditCoursePrice(course.price);
    setEditCourseThumbnail(course.thumbnail || "");
    setEditCoursePublished(course.isPublished);
    setEditCourseError(null);

    // Fetch course details to get the current category
    try {
      const response = await fetch(`/api/courses/${course.id}`);
      if (response.ok) {
        const courseData = await response.json();
        if (courseData.courseDetails?.category) {
          setEditCourseCategory(courseData.courseDetails.category);
        } else {
          setEditCourseCategory("");
        }
      }
    } catch (error) {
      console.error('Error fetching course details:', error);
      setEditCourseCategory("");
    }
  };

  // Handler to cancel editing
  const handleCancelEditCourse = () => {
    setEditingCourseId(null);
    setEditCourseTitle("");
    setEditCourseDescription("");
    setEditCoursePrice(0);
    setEditCourseThumbnail("");
    setEditCoursePublished(false);
    setEditCourseError(null);
  };

  // Handler to submit course edit
  const handleEditCourse = async (courseId: string) => {
    setEditCourseLoading(true);
    setEditCourseError(null);
    try {
      const res = await fetch(`/api/courses/${courseId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editCourseTitle,
          description: editCourseDescription,
          price: editCoursePrice,
          thumbnail: editCourseThumbnail,
          category: editCourseCategory,
          isPublished: editCoursePublished,
        }),
      });
      if (!res.ok) throw new Error("Failed to update course");
      const updatedCourse = await res.json();
      setCourses(courses.map(c => c.id === courseId ? updatedCourse : c));
      setEditingCourseId(null);
      setEditCourseTitle("");
      setEditCourseDescription("");
      setEditCoursePrice(0);
      setEditCourseThumbnail("");
      setEditCourseCategory("");
      setEditCoursePublished(false);
    } catch {
      setEditCourseError("Failed to update course");
    } finally {
      setEditCourseLoading(false);
    }
  };

  const handleTogglePublish = async (course: Course) => {
    setPublishLoadingId(course.id);
    setPublishError(null);
    try {
      const res = await fetch(`/api/courses/${course.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !course.isPublished }),
      });
      if (!res.ok) throw new Error("Failed to update publish status");
      const updatedCourse = await res.json();
      setCourses(courses.map(c => c.id === course.id ? updatedCourse : c));
    } catch {
      setPublishError("Failed to update publish status");
    } finally {
      setPublishLoadingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="mb-6 text-gray-700">You do not have permission to view this page.</p>
        <Link href="/dashboard" className="px-6 py-2 rounded bg-blue-500 text-white font-semibold">Back to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-yellow-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-6">Admin Panel</h1>
        <p className="text-lg text-gray-800 mb-8">Manage courses, sessions, and content here.</p>
        {/* Create Course Form */}
        <form onSubmit={handleCreate} className="mb-10 space-y-4 bg-blue-100 rounded-lg p-6 shadow border border-blue-200">
          <h2 className="text-2xl font-bold text-blue-800 mb-2">Add New Course</h2>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Title</label>
            <input className="w-full border border-black rounded px-3 py-2 text-gray-900 bg-white font-bold placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" value={title} onChange={e => setTitle(e.target.value)} required disabled={creating} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Description</label>
            <div className="border border-black rounded overflow-hidden">
              <EditorContent 
                editor={createCourseEditor} 
                className="min-h-[200px] p-3 text-gray-900 bg-white font-bold placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-gray-900">Course Type:</span>
            <button
              type="button"
              className={`px-4 py-1 rounded-l bg-${isFree ? 'blue-700' : 'gray-200'} text-${isFree ? 'white' : 'gray-900'} font-bold border border-black focus:outline-none`}
              onClick={() => setIsFree(true)}
              disabled={creating}
            >
              Free
            </button>
            <button
              type="button"
              className={`px-4 py-1 rounded-r bg-${!isFree ? 'blue-700' : 'gray-200'} text-${!isFree ? 'white' : 'gray-900'} font-bold border border-black focus:outline-none`}
              onClick={() => setIsFree(false)}
              disabled={creating}
            >
              Paid
            </button>
          </div>
          {!isFree && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Price ($)</label>
              <input type="number" className="w-full border border-black rounded px-3 py-2 text-gray-900 bg-white font-bold placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" value={price} onChange={e => setPrice(Number(e.target.value))} min="0" step="0.01" required={!isFree} disabled={creating} />
            </div>
          )}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Image URL</label>
            <input className="w-full border border-black rounded px-3 py-2 text-gray-900 bg-white font-bold placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" value={imageUrl} onChange={e => setImageUrl(e.target.value)} required disabled={creating} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1">Category</label>
            <div className="flex gap-2">
              {categoriesLoading ? (
                <div className="text-gray-600">Loading categories...</div>
              ) : (
                <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={creating}>
                  <SelectTrigger className="flex-1 border border-black rounded px-3 py-2 text-gray-900 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          {category.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <button
                type="button"
                onClick={refreshCategories}
                disabled={categoriesLoading}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300 disabled:opacity-50"
                title="Refresh categories"
              >
                🔄
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {categories.length} categories loaded
            </div>
          </div>
          {createError && <div className="text-red-700 font-bold">{createError}</div>}
          <button type="submit" className="px-6 py-2 rounded bg-blue-800 text-white font-bold hover:bg-blue-900" disabled={creating}>{creating ? "Creating..." : "Create Course"}</button>
        </form>
        {/* Courses List */}
        <h2 className="text-2xl font-bold text-blue-800 mb-4">All Courses</h2>
        {loading ? (
          <div className="text-gray-700">Loading courses...</div>
        ) : error ? (
          <div className="text-red-700 font-bold">{error}</div>
        ) : courses.length === 0 ? (
          <div className="text-gray-600">No courses found.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {courses.map(course => (
              <div key={course.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow flex flex-col relative mb-8">
                {editingCourseId === course.id ? (
                  <form
                    className="flex flex-col gap-3"
                    onSubmit={e => {
                      e.preventDefault();
                      handleEditCourse(course.id);
                    }}
                  >
                    <label className="text-sm font-semibold text-gray-900">Title</label>
                    <input
                      className="border border-black rounded px-3 py-2 text-gray-900 bg-white font-bold placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editCourseTitle}
                      onChange={e => setEditCourseTitle(e.target.value)}
                      required
                    />
                    <label className="text-sm font-semibold text-gray-900">Description</label>
                    <div className="border border-black rounded overflow-hidden">
                      <EditorContent 
                        editor={editCourseEditor} 
                        className="min-h-[200px] p-3 text-gray-900 bg-white font-bold placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <label className="text-sm font-semibold text-gray-900">Price ($)</label>
                    <input
                      type="number"
                      className="border border-black rounded px-3 py-2 text-gray-900 bg-white font-bold placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editCoursePrice}
                      onChange={e => setEditCoursePrice(Number(e.target.value))}
                      min="0"
                      step="0.01"
                      required
                    />
                    <label className="text-sm font-semibold text-gray-900">Image URL</label>
                    <input
                      className="border border-black rounded px-3 py-2 text-gray-900 bg-white font-bold placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editCourseThumbnail}
                      onChange={e => setEditCourseThumbnail(e.target.value)}
                      required
                    />
                    <label className="text-sm font-semibold text-gray-900">Category</label>
                    <div className="flex gap-2">
                      {categoriesLoading ? (
                        <div className="text-gray-600">Loading categories...</div>
                      ) : (
                        <Select value={editCourseCategory} onValueChange={setEditCourseCategory}>
                          <SelectTrigger className="flex-1 border border-black rounded px-3 py-2 text-gray-900 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                <div className="flex items-center gap-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: category.color }}
                                  />
                                  {category.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <button
                        type="button"
                        onClick={refreshCategories}
                        disabled={categoriesLoading}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded font-semibold hover:bg-gray-300 disabled:opacity-50"
                        title="Refresh categories"
                      >
                        🔄
                      </button>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {categories.length} categories loaded
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`published-${course.id}`}
                        checked={editCoursePublished}
                        onChange={e => setEditCoursePublished(e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                      />
                      <label htmlFor={`published-${course.id}`} className="text-sm font-semibold text-gray-900">Published</label>
                    </div>
                    {editCourseError && <div className="text-red-700 font-bold">{editCourseError}</div>}
                    <div className="flex gap-2 mt-2">
                      <button type="submit" className="px-4 py-2 bg-blue-700 text-white rounded font-semibold" disabled={editCourseLoading}>
                        {editCourseLoading ? "Saving..." : "Save"}
                      </button>
                      <button type="button" className="px-4 py-2 bg-gray-400 text-white rounded font-semibold" onClick={handleCancelEditCourse} disabled={editCourseLoading}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <img src={course.thumbnail || "/placeholder.png"} alt={course.title} className="w-full h-40 object-cover rounded mb-2" />
                    <h3 className="text-xl font-bold text-blue-900">{course.title}</h3>
                    <div className="text-gray-800 mb-2 line-clamp-2">
                      <RichTextDisplay 
                        content={course.description} 
                        className="text-sm"
                        maxHeight="4rem"
                      />
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-blue-800 font-semibold">{course.price === 0 ? "Free" : `$${course.price}`}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded ${course.isPublished ? 'bg-green-200 text-green-900' : 'bg-yellow-200 text-yellow-900'}`}>{course.isPublished ? 'Published' : 'Draft'}</span>
                        <button
                          className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-blue-400 ${course.isPublished ? 'bg-yellow-50 border-yellow-300 text-yellow-900 hover:bg-yellow-100' : 'bg-green-50 border-green-300 text-green-900 hover:bg-green-100'}`}
                          onClick={() => handleTogglePublish(course)}
                          disabled={publishLoadingId === course.id || !!editingCourseId}
                          title={course.isPublished ? 'Unpublish this course' : 'Publish this course'}
                          aria-label={course.isPublished ? 'Unpublish' : 'Publish'}
                        >
                          {publishLoadingId === course.id ? (
                            <svg className="animate-spin h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                          ) : course.isPublished ? (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          )}
                          <span>{course.isPublished ? 'Unpublish' : 'Publish'}</span>
                        </button>
                      </div>
                    </div>
                    <span className="text-xs text-gray-600 mt-1">Created: {new Date(course.createdAt).toLocaleDateString()}</span>
                    <span className="text-xs text-gray-500 font-mono">ID: {course.id || 'N/A'}</span>
                    <div className="flex gap-2 mt-3">
                      <button
                        className="px-4 py-2 bg-yellow-400 text-black rounded font-semibold hover:bg-yellow-500"
                        onClick={() => handleStartEditCourse(course)}
                        disabled={editCourseLoading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => { setDeleteId(course.id); setDeleteInput(""); setDeleteError(null); }}
                        className="px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700"
                        disabled={editCourseLoading}
                      >
                        Delete
                      </button>
                    </div>
                    {!editingCourseId && publishError && (
                      <div className="text-red-700 font-bold mb-2">{publishError}</div>
                    )}
                  </>
                )}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => router.push(`/dashboard/admin/courses/${course.id}/content`)}
                    className="flex-1 px-4 py-2 bg-blue-700 text-white rounded font-semibold hover:bg-blue-800"
                  >
                    Manage Content
                  </button>
                  <button
                    onClick={() => router.push(`/dashboard/admin/courses/${course.id}/content-details`)}
                    className="flex-1 px-4 py-2 bg-green-700 text-white rounded font-semibold hover:bg-green-800"
                  >
                    Manage Content Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
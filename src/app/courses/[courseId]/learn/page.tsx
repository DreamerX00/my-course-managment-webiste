"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { MarkdownDisplay } from "@/components/ui/markdown-display";

interface Chapter {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  isFree: boolean;
  content?: string; // Added content field
}

interface Course {
  id: string;
  title: string;
  description: string;
  chapters: Chapter[];
}

interface UserProgress {
  courseId: string;
  userId: string;
  completedChapters: string[];
  completedCount: number;
  totalCount: number;
  progressPercentage: number;
  isCompleted: boolean;
  lastActivity: string;
}

// Utility to parse markdown content from JSON or string
function getMarkdownContent(content: string) {
  try {
    const parsed = JSON.parse(content);
    if (typeof parsed === "string") return parsed;
    if (parsed && typeof parsed === "object" && parsed.markdown)
      return parsed.markdown;
    return content;
  } catch {
    return content;
  }
}

// Utility: Extract only H1 and H2 headings for TOC
function extractMarkdownHeadings(markdown: string) {
  const lines = markdown.split("\n");
  const headings = [];
  for (const line of lines) {
    const match = /^(#{1,2})\s+(.*)/.exec(line); // Only # and ##
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-");
      headings.push({ level, text, id });
    }
  }
  return headings;
}

export default function CourseLearnPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  const { status } = useSession();
  const { toast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);
  // TOC open state for mobile
  const [tocMobileOpen, setTocMobileOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch course");
        }
        const data = await response.json();
        setCourse(data);
        if (data.chapters.length > 0) {
          setCurrentChapter(data.chapters[0]);
        }
      } catch {
        toast({
          title: "Error",
          description: "Failed to load course",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId, toast]);

  // Fetch progress data
  useEffect(() => {
    const fetchProgress = async () => {
      if (status !== "authenticated") return;

      try {
        const response = await fetch(`/api/courses/${courseId}/progress`);
        if (response.ok) {
          const data = await response.json();
          setProgress(data);
        }
      } catch (error) {
        console.error("Failed to fetch progress:", error);
      }
    };

    fetchProgress();
  }, [courseId, status]);

  // Handle marking chapter as complete/incomplete
  const handleToggleComplete = async (
    chapterId: string,
    isCompleted: boolean
  ) => {
    setLoadingProgress(true);

    // Optimistic update
    setProgress((prev) => {
      if (!prev) return prev;

      const newCompletedChapters = isCompleted
        ? [...prev.completedChapters, chapterId]
        : prev.completedChapters.filter((id) => id !== chapterId);

      const newCompletedCount = newCompletedChapters.length;
      const newProgressPercentage =
        prev.totalCount > 0
          ? Math.round((newCompletedCount / prev.totalCount) * 100)
          : 0;

      return {
        ...prev,
        completedChapters: newCompletedChapters,
        completedCount: newCompletedCount,
        progressPercentage: newProgressPercentage,
        isCompleted: newProgressPercentage === 100,
      };
    });

    try {
      const response = await fetch(`/api/courses/${courseId}/progress`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chapterId,
          isCompleted,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update progress");
      }

      const updatedProgress = await response.json();
      setProgress(updatedProgress);

      toast({
        title: isCompleted ? "Chapter Completed!" : "Progress Updated",
        description: isCompleted
          ? `Great job! You're ${updatedProgress.progressPercentage}% done.`
          : "Progress updated successfully.",
      });
    } catch {
      // Revert optimistic update on error
      toast({
        title: "Error",
        description: "Failed to update progress. Please try again.",
        variant: "destructive",
      });

      // Refetch progress to revert
      const response = await fetch(`/api/courses/${courseId}/progress`);
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } finally {
      setLoadingProgress(false);
    }
  };

  const isChapterCompleted = (chapterId: string) => {
    return progress?.completedChapters?.includes(chapterId) || false;
  };

  // Memoized TOC for current chapter
  const tocHeadings = currentChapter?.content
    ? extractMarkdownHeadings(getMarkdownContent(currentChapter.content))
    : [];

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Course not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar Navigation */}
      <aside
        className={`hidden md:block md:w-64 border-r bg-gray-50 px-4 py-8 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto transition-all duration-300 z-40 md:static md:left-0`}
      >
        <button
          className="md:hidden absolute top-4 right-4 text-gray-600 hover:text-blue-700 z-50"
          onClick={() => setTocMobileOpen(false)}
        >
          ✕
        </button>
        <h2 className="text-lg font-bold mb-6 text-blue-900">Chapters</h2>
        <nav className="space-y-2">
          {course.chapters.map((chapter) => {
            const completed = isChapterCompleted(chapter.id);
            return (
              <button
                key={chapter.id}
                onClick={() => {
                  setCurrentChapter(chapter);
                  // Scroll to top of main content
                  const main = document.querySelector("main");
                  if (main)
                    main.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium flex items-center gap-2 transition-colors border border-transparent
                  ${
                    currentChapter?.id === chapter.id
                      ? "bg-blue-100 text-blue-900 border-blue-400"
                      : "hover:bg-blue-50 text-gray-800"
                  }
                `}
              >
                {completed ? (
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                ) : (
                  <Circle className="w-5 h-5 text-gray-400" />
                )}
                <span className="truncate">{chapter.title}</span>
              </button>
            );
          })}
        </nav>
      </aside>
      {/* Mobile sidebar toggle button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 bg-blue-600 text-white rounded-full p-2 shadow-lg"
        onClick={() => setTocMobileOpen(true)}
        style={{ marginTop: "3.5rem" }}
      >
        ☰
      </button>
      {/* Main Content + TOC wrapper */}
      <div className="flex flex-1">
        <main className="flex-1 max-w-4xl mx-auto px-4 py-10">
          {/* Progress Bar */}
          {progress && (
            <div
              className="mb-6 p-4 bg-linear-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 sticky top-20 z-30 shadow"
              style={{ marginTop: "1rem" }}
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">
                  Your Progress
                </h3>
                <span className="text-sm font-bold text-blue-600">
                  {progress.progressPercentage}% Complete
                </span>
              </div>
              <Progress value={progress.progressPercentage} className="h-3" />
              <p className="text-xs text-gray-600 mt-2">
                {progress.completedCount} of {progress.totalCount} items
                completed
              </p>
            </div>
          )}

          {/* Only show video block if videoUrl exists */}
          {currentChapter?.videoUrl && (
            <div className="aspect-video relative bg-black rounded-lg overflow-hidden mb-6">
              <video
                src={currentChapter.videoUrl}
                controls
                className="w-full h-full"
              />
            </div>
          )}
          <div className="mt-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold">{currentChapter?.title}</h1>
                <p className="mt-2 text-muted-foreground">
                  {currentChapter?.description}
                </p>
              </div>
              {currentChapter && (
                <div className="flex items-center gap-2 pt-1">
                  <Checkbox
                    id={`complete-${currentChapter.id}`}
                    checked={isChapterCompleted(currentChapter.id)}
                    onCheckedChange={(checked) =>
                      handleToggleComplete(
                        currentChapter.id,
                        checked as boolean
                      )
                    }
                    disabled={loadingProgress}
                  />
                  <label
                    htmlFor={`complete-${currentChapter.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Mark as complete
                  </label>
                </div>
              )}
            </div>
          </div>
          {/* Markdown Content - formatted and parsed */}
          {currentChapter?.content && (
            <div className="prose dark:prose-invert max-w-3xl mx-auto mt-8 bg-white/90 border border-blue-100 shadow rounded-xl p-6">
              <MarkdownDisplay
                content={getMarkdownContent(currentChapter.content)}
              />
            </div>
          )}

          {/* Table of Contents - extracted from markdown */}
          {tocHeadings.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-bold mb-4">Table of Contents</h2>
              <ul className="space-y-2">
                {tocHeadings.map((heading) => (
                  <li key={heading.id} className="text-sm">
                    <a
                      href={`#${heading.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {/* Next/Previous Chapter Navigation */}
          {course && currentChapter && (
            <div className="flex justify-between items-center mt-10 gap-4">
              {(() => {
                const idx = course.chapters.findIndex(
                  (c) => c.id === currentChapter.id
                );
                const prev = idx > 0 ? course.chapters[idx - 1] : null;
                const next =
                  idx < course.chapters.length - 1
                    ? course.chapters[idx + 1]
                    : null;
                return (
                  <>
                    <button
                      disabled={!prev}
                      onClick={() => prev && setCurrentChapter(prev)}
                      className={`px-5 py-2 rounded font-semibold border transition-colors shadow-sm ${
                        prev
                          ? "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                          : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      }`}
                    >
                      ← Previous
                    </button>
                    <button
                      disabled={!next}
                      onClick={() => next && setCurrentChapter(next)}
                      className={`px-5 py-2 rounded font-semibold border transition-colors shadow-sm ${
                        next
                          ? "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
                          : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      }`}
                    >
                      Next →
                    </button>
                  </>
                );
              })()}
            </div>
          )}
        </main>
        {/* Sticky TOC (Table of Contents) */}
        <aside
          className={`hidden lg:block w-72 border-l bg-linear-to-b from-white via-blue-50 to-white px-6 py-8 sticky top-0 h-screen overflow-y-auto shadow-lg rounded-l-xl ml-2 ${
            tocMobileOpen
              ? "fixed left-0 top-0 z-50 bg-white w-full h-full"
              : ""
          }`}
        >
          <button
            className="lg:hidden absolute top-4 right-4 text-gray-600 hover:text-blue-700 z-50"
            onClick={() => setTocMobileOpen(false)}
          >
            ✕
          </button>
          <h2 className="text-lg font-bold mb-4 text-blue-900 border-b pb-2 border-blue-200">
            On this page
          </h2>
          <nav className="space-y-1 text-sm">
            {tocHeadings.length === 0 && (
              <div className="text-gray-400">No sections</div>
            )}
            {tocHeadings.map((heading) => (
              <a
                key={heading.id + heading.text}
                href={`#${heading.id}`}
                className={`block py-1 px-3 rounded transition-colors
                  ${
                    heading.level === 1
                      ? "font-bold text-blue-900"
                      : "pl-4 text-blue-700"
                  }
                  hover:bg-blue-100 hover:text-blue-800
                `}
              >
                {heading.text}
              </a>
            ))}
          </nav>
        </aside>
        {/* Mobile TOC toggle button */}
        <button
          className="lg:hidden fixed top-4 right-4 z-50 bg-blue-600 text-white rounded-full p-2 shadow-lg"
          onClick={() => setTocMobileOpen(true)}
        >
          ☰
        </button>
      </div>
    </div>
  );
}

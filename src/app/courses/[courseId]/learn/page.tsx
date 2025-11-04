"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";
import { MarkdownDisplay } from "@/components/ui/markdown-display";

// Utility function to extract YouTube video ID from various URL formats
function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;

  let videoId: string | null = null;

  // Extract from iframe embed code
  const iframeRegex = /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/;
  const iframeMatch = iframeRegex.exec(url);
  if (iframeMatch) {
    videoId = iframeMatch[1];
  }

  // Extract from regular YouTube URL (watch?v=)
  if (!videoId) {
    const urlRegex = /[?&]v=([a-zA-Z0-9_-]+)/;
    const urlMatch = urlRegex.exec(url);
    if (urlMatch) {
      videoId = urlMatch[1];
    }
  }

  // Extract from youtu.be short URL
  if (!videoId) {
    const shortRegex = /youtu\.be\/([a-zA-Z0-9_-]+)/;
    const shortMatch = shortRegex.exec(url);
    if (shortMatch) {
      videoId = shortMatch[1];
    }
  }

  // If we found a video ID, return the embed URL
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }

  // If it's already an embed URL, return it
  if (url.includes("youtube.com/embed/")) {
    return url;
  }

  return null;
}

// Check if URL is a YouTube video
function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

interface Subchapter {
  id: string;
  title: string;
  content?: string;
  videoUrl: string;
  position: number;
  chapterId: string;
}

interface Chapter {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  isFree: boolean;
  content?: string;
  subchapters?: Subchapter[];
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
  const [currentSubchapter, setCurrentSubchapter] = useState<Subchapter | null>(
    null
  );
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(
    new Set()
  );
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

  // Determine what content to display (subchapter takes priority)
  const displayContent = currentSubchapter || currentChapter;
  const displayTitle = currentSubchapter?.title || currentChapter?.title;
  const displayDescription = currentSubchapter
    ? ""
    : currentChapter?.description;
  const displayVideoUrl =
    currentSubchapter?.videoUrl || currentChapter?.videoUrl;
  const displayContentBody =
    currentSubchapter?.content || currentChapter?.content;

  // Memoized TOC for current content (chapter or subchapter)
  const tocHeadings = displayContentBody
    ? extractMarkdownHeadings(getMarkdownContent(displayContentBody))
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
    <div className="flex min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      {/* Mobile Overlay for Sidebar */}
      {tocMobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setTocMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation - Chapters */}
      <aside
        className={`
          fixed md:sticky top-0 md:top-20 left-0 
          w-80 md:w-72 h-screen md:h-[calc(100vh-5rem)]
          bg-white border-r border-gray-200 shadow-xl md:shadow-none
          px-6 py-6 overflow-y-auto
          transition-transform duration-300 ease-in-out
          z-50 md:z-auto
          ${
            tocMobileOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Close button for mobile */}
        <button
          className="md:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700 p-2"
          onClick={() => setTocMobileOpen(false)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Course Content
          </h2>
          <p className="text-sm text-gray-600">
            {course.chapters.length}{" "}
            {course.chapters.length === 1 ? "chapter" : "chapters"}
          </p>
        </div>

        <nav className="space-y-1">
          {course.chapters.map((chapter, idx) => {
            const completed = isChapterCompleted(chapter.id);
            const isCurrent =
              currentChapter?.id === chapter.id && !currentSubchapter;
            const hasSubchapters =
              chapter.subchapters && chapter.subchapters.length > 0;
            const isExpanded = expandedChapters.has(chapter.id);

            return (
              <div key={chapter.id}>
                <div className="flex items-stretch gap-1">
                  {/* Expand/Collapse button for chapters with subchapters */}
                  {hasSubchapters ? (
                    <button
                      onClick={() => {
                        setExpandedChapters((prev) => {
                          const newSet = new Set(prev);
                          if (newSet.has(chapter.id)) {
                            newSet.delete(chapter.id);
                          } else {
                            newSet.add(chapter.id);
                          }
                          return newSet;
                        });
                      }}
                      className="px-2 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  ) : (
                    <div className="w-8" />
                  )}

                  {/* Chapter button */}
                  <button
                    onClick={() => {
                      setCurrentChapter(chapter);
                      setCurrentSubchapter(null);
                      setTocMobileOpen(false);
                      // Auto-expand chapter if it has subchapters and is not expanded
                      if (hasSubchapters && !isExpanded) {
                        setExpandedChapters((prev) => {
                          const newSet = new Set(prev);
                          newSet.add(chapter.id);
                          return newSet;
                        });
                      }
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`
                      flex-1 text-left px-4 py-3 rounded-lg font-medium 
                      flex items-start gap-3 transition-all
                      ${
                        isCurrent
                          ? "bg-blue-600 text-white shadow-md"
                          : "hover:bg-gray-100 text-gray-700"
                      }
                    `}
                  >
                    <div className="shrink-0 mt-0.5">
                      {completed ? (
                        <CheckCircle2
                          className={`w-5 h-5 ${
                            isCurrent ? "text-white" : "text-green-500"
                          }`}
                        />
                      ) : (
                        <Circle
                          className={`w-5 h-5 ${
                            isCurrent ? "text-white" : "text-gray-400"
                          }`}
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold uppercase tracking-wide mb-1 opacity-70">
                        Chapter {idx + 1}
                      </div>
                      <div className="text-sm line-clamp-2">
                        {chapter.title}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Render subchapters if expanded */}
                {hasSubchapters && isExpanded && (
                  <div className="ml-6 mt-1 space-y-1 border-l-2 border-gray-200 pl-2">
                    {chapter.subchapters!.map((subchapter, subIdx) => {
                      const subCompleted = isChapterCompleted(subchapter.id);
                      const isSubCurrent =
                        currentSubchapter?.id === subchapter.id;

                      return (
                        <button
                          key={subchapter.id}
                          onClick={() => {
                            setCurrentChapter(chapter);
                            setCurrentSubchapter(subchapter);
                            setTocMobileOpen(false);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                          }}
                          className={`
                            w-full text-left px-3 py-2 rounded-lg font-medium 
                            flex items-start gap-2 transition-all text-sm
                            ${
                              isSubCurrent
                                ? "bg-blue-500 text-white shadow-md"
                                : "hover:bg-gray-50 text-gray-600"
                            }
                          `}
                        >
                          <div className="shrink-0 mt-0.5">
                            {subCompleted ? (
                              <CheckCircle2
                                className={`w-4 h-4 ${
                                  isSubCurrent ? "text-white" : "text-green-500"
                                }`}
                              />
                            ) : (
                              <Circle
                                className={`w-4 h-4 ${
                                  isSubCurrent ? "text-white" : "text-gray-400"
                                }`}
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold uppercase tracking-wide mb-0.5 opacity-70">
                              {idx + 1}.{subIdx + 1}
                            </div>
                            <div className="text-xs line-clamp-2">
                              {subchapter.title}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-20 left-4 z-30 bg-white text-gray-700 rounded-lg p-3 shadow-lg border border-gray-200 hover:bg-gray-50"
        onClick={() => setTocMobileOpen(true)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
      {/* Main Content + TOC wrapper */}
      <div className="flex flex-1 flex-col lg:flex-row">
        <main className="flex-1 w-full px-4 md:px-8 py-6 md:py-10 max-w-5xl mx-auto">
          {/* Progress Bar */}
          {progress && (
            <div className="mb-6 p-5 bg-linear-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl border border-blue-200 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wide">
                  Your Progress
                </h3>
                <span className="text-lg font-bold text-blue-600">
                  {progress.progressPercentage}%
                </span>
              </div>
              <Progress
                value={progress.progressPercentage}
                className="h-3 mb-2"
              />
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  {progress.completedCount} of {progress.totalCount} chapters
                  completed
                </span>
                {progress.isCompleted && (
                  <span className="text-green-600 font-semibold">
                    🎉 Course Complete!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Video Player */}
          {displayVideoUrl && (
            <div className="relative bg-black rounded-xl overflow-hidden mb-8 shadow-2xl">
              <div className="aspect-video">
                {isYouTubeUrl(displayVideoUrl) ? (
                  <iframe
                    src={getYouTubeEmbedUrl(displayVideoUrl) || ""}
                    title={displayTitle}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={displayVideoUrl}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>
            </div>
          )}

          {/* Chapter Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                  {displayTitle}
                </h1>
                {displayDescription && (
                  <p className="text-lg text-gray-600">{displayDescription}</p>
                )}
              </div>
              {displayContent && (
                <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <Checkbox
                    id={`complete-${displayContent.id}`}
                    checked={isChapterCompleted(displayContent.id)}
                    onCheckedChange={(checked) =>
                      handleToggleComplete(
                        displayContent.id,
                        checked as boolean
                      )
                    }
                    disabled={loadingProgress}
                    className="w-5 h-5"
                  />
                  <label
                    htmlFor={`complete-${displayContent.id}`}
                    className="text-sm font-semibold text-gray-700 cursor-pointer select-none"
                  >
                    {isChapterCompleted(displayContent.id)
                      ? "Completed ✓"
                      : "Mark complete"}
                  </label>
                </div>
              )}
            </div>
          </div>
          {/* Markdown Content */}
          {displayContentBody && (
            <div className="prose prose-lg dark:prose-invert max-w-none bg-white rounded-xl border border-gray-200 shadow-sm p-6 md:p-8 mb-8">
              <MarkdownDisplay
                content={getMarkdownContent(displayContentBody)}
              />
            </div>
          )}

          {/* Next/Previous Chapter Navigation */}
          {course && currentChapter && (
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 mt-10">
              {(() => {
                // Build a flat list of all items (chapters and subchapters)
                const allItems: Array<{
                  type: "chapter" | "subchapter";
                  data: Chapter | Subchapter;
                  chapterParent?: Chapter;
                }> = [];
                course.chapters.forEach((chapter) => {
                  allItems.push({ type: "chapter", data: chapter });
                  if (chapter.subchapters && chapter.subchapters.length > 0) {
                    chapter.subchapters.forEach((sub) => {
                      allItems.push({
                        type: "subchapter",
                        data: sub,
                        chapterParent: chapter,
                      });
                    });
                  }
                });

                // Find current index
                const currentId = currentSubchapter?.id || currentChapter.id;
                const currentIndex = allItems.findIndex(
                  (item) => item.data.id === currentId
                );

                const prevItem =
                  currentIndex > 0 ? allItems[currentIndex - 1] : null;
                const nextItem =
                  currentIndex < allItems.length - 1
                    ? allItems[currentIndex + 1]
                    : null;

                const handlePrev = () => {
                  if (prevItem) {
                    if (prevItem.type === "chapter") {
                      setCurrentChapter(prevItem.data as Chapter);
                      setCurrentSubchapter(null);
                    } else {
                      setCurrentChapter(prevItem.chapterParent!);
                      setCurrentSubchapter(prevItem.data as Subchapter);
                    }
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                };

                const handleNext = () => {
                  if (nextItem) {
                    if (nextItem.type === "chapter") {
                      setCurrentChapter(nextItem.data as Chapter);
                      setCurrentSubchapter(null);
                    } else {
                      setCurrentChapter(nextItem.chapterParent!);
                      setCurrentSubchapter(nextItem.data as Subchapter);
                    }
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }
                };

                return (
                  <>
                    <button
                      disabled={!prevItem}
                      onClick={handlePrev}
                      className={`
                        flex-1 sm:flex-none px-6 py-3 rounded-lg font-semibold 
                        border-2 transition-all flex items-center justify-center gap-2
                        ${
                          prevItem
                            ? "bg-white text-blue-700 border-blue-300 hover:bg-blue-50 hover:border-blue-400 shadow-md hover:shadow-lg"
                            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        }
                      `}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                      <span className="hidden sm:inline">Previous</span>
                      <span className="sm:hidden">Prev</span>
                    </button>
                    <button
                      disabled={!nextItem}
                      onClick={handleNext}
                      className={`
                        flex-1 sm:flex-none px-6 py-3 rounded-lg font-semibold 
                        border-2 transition-all flex items-center justify-center gap-2
                        ${
                          nextItem
                            ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                            : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                        }
                      `}
                    >
                      <span className="hidden sm:inline">
                        Next {nextItem?.type === "chapter" ? "Chapter" : ""}
                      </span>
                      <span className="sm:hidden">Next</span>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                );
              })()}
            </div>
          )}
        </main>

        {/* Sticky TOC Sidebar - Desktop Only */}
        <aside className="hidden lg:block w-80 border-l border-gray-200 bg-white px-6 py-8 sticky top-20 h-[calc(100vh-5rem)] overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              On This Page
            </h2>
            <div className="h-1 w-12 bg-blue-600 rounded-full"></div>
          </div>

          <nav className="space-y-1">
            {tocHeadings.length === 0 ? (
              <div className="text-sm text-gray-400 italic py-2">
                No sections available
              </div>
            ) : (
              tocHeadings.map((heading, index) => (
                <a
                  key={`toc-sidebar-${index}-${heading.id}-${heading.text}`}
                  href={`#${heading.id}`}
                  className={`
                    block py-2 px-3 rounded-lg text-sm transition-all
                    hover:bg-blue-50 hover:text-blue-700
                    ${
                      heading.level === 1
                        ? "font-semibold text-gray-900 border-l-2 border-blue-600 pl-4"
                        : "text-gray-600 pl-6"
                    }
                  `}
                >
                  {heading.text}
                </a>
              ))
            )}
          </nav>

          {/* Course Progress Summary in TOC */}
          {progress && (
            <div className="mt-8 p-4 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h3 className="text-sm font-bold text-gray-800 mb-2">
                Course Progress
              </h3>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-600">Completion</span>
                <span className="text-sm font-bold text-blue-600">
                  {progress.progressPercentage}%
                </span>
              </div>
              <Progress value={progress.progressPercentage} className="h-2" />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

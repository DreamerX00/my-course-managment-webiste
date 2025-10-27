"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useToast } from "@/components/ui/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle } from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  isFree: boolean;
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
    return progress?.completedChapters.includes(chapterId) || false;
  };

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
    <div className="container py-10">
      {/* Progress Bar */}
      {progress && (
        <div className="mb-6 p-4 bg-linear-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
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
            {progress.completedCount} of {progress.totalCount} items completed
          </p>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <div className="aspect-video relative bg-black rounded-lg overflow-hidden">
            {currentChapter?.videoUrl ? (
              <video
                src={currentChapter.videoUrl}
                controls
                className="w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-white">
                No video available
              </div>
            )}
          </div>
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
        </div>

        <div className="rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">Course Content</h2>
          <div className="space-y-2">
            {course.chapters.map((chapter) => {
              const completed = isChapterCompleted(chapter.id);
              return (
                <button
                  key={chapter.id}
                  onClick={() => setCurrentChapter(chapter)}
                  className={`w-full text-left p-4 border rounded-lg transition-colors ${
                    currentChapter?.id === chapter.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "hover:bg-muted"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {completed ? (
                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{chapter.title}</h3>
                      <p
                        className={`text-sm mt-1 ${
                          currentChapter?.id === chapter.id
                            ? "text-primary-foreground/80"
                            : "text-muted-foreground"
                        }`}
                      >
                        {chapter.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

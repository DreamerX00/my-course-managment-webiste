"use client"
import { useEffect, useState, use, Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Lock, CheckCircle, Menu, ChevronDown, ChevronRight } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { EditorContent, useEditor } from '@tiptap/react';
import { editorExtensions } from "@/lib/tiptap-extensions";
import clsx from "clsx";

function parseContent(content: any) {
  if (!content) return undefined;
  if (typeof content === 'string') {
    try {
      return JSON.parse(content);
    } catch {
      return content;
    }
  }
  return content;
}

// Data structures from DB
interface Subchapter {
  id: string;
  title: string;
  content: string;
}

interface Chapter {
  id: string;
  title: string;
  content: string;
  isFree: boolean;
  subchapters: Subchapter[];
}

interface Course {
  id:string;
  title: string;
  chapters: Chapter[];
  price: number | null;
}

// API call to our new endpoint
const fetchCourseData = async (courseId: string): Promise<Course> => {
  const response = await fetch(`/api/courses/${courseId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch course data');
  }
  return response.json();
};

// --- Components ---

const CourseSidebar = ({ course, currentItemId, onSelectItem, completedItems, hasPurchased, expandedChapters, onToggleChapter }: {
  course: Course,
  currentItemId: string,
  onSelectItem: (itemId: string, isSubchapter: boolean) => void,
  completedItems: Set<string>,
  hasPurchased: boolean,
  expandedChapters: Set<string>,
  onToggleChapter: (chapterId: string) => void,
}) => (
  <aside className="sticky top-0 h-full overflow-y-auto w-64 flex-shrink-0 border-r border-slate-200 bg-white p-3 hidden lg:block">
    <h2 className="text-lg font-bold mb-3 text-slate-900 px-3">Course Content</h2>
    <nav className="space-y-1">
      {course.chapters.map((chapter) => {
        const isChapterLocked = !!course.price && !chapter.isFree && !hasPurchased;
        const isChapterCompleted = completedItems.has(chapter.id);
        const isExpanded = expandedChapters.has(chapter.id);

        return (
          <div key={chapter.id}>
            <button
              onClick={() => onSelectItem(chapter.id, false)}
              className={clsx(
                "w-full text-left px-3 py-2 rounded-md flex items-center justify-between text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all duration-150 text-sm",
                {
                  "bg-slate-100 text-slate-900 font-semibold": currentItemId === chapter.id,
                }
              )}
            >
              <span className="font-semibold truncate">{chapter.title}</span>
              <div className="flex items-center gap-1">
                {isChapterCompleted && <CheckCircle className="w-4 h-4 text-green-500" />}
                {isChapterLocked && <Lock className="w-4 h-4 text-slate-400" />}
                {chapter.subchapters.length > 0 && (
                  <span onClick={(e) => { e.stopPropagation(); onToggleChapter(chapter.id); }} className="p-1 rounded-full hover:bg-slate-200">
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                  </span>
                )}
              </div>
            </button>
            {isExpanded && (
              <div className="pl-4 mt-1 space-y-1 border-l-2 border-slate-200 ml-5">
                {chapter.subchapters.map((subchapter) => {
                  const isSubchapterCompleted = completedItems.has(subchapter.id);
                  return (
                    <button
                      key={subchapter.id}
                      onClick={() => onSelectItem(subchapter.id, true)}
                      className={clsx(
                        "w-full text-left pl-3 pr-2 py-1.5 rounded-md transition-all duration-150 flex items-center justify-between text-slate-600 text-sm",
                        {
                          "bg-blue-100 text-blue-800 font-bold": currentItemId === subchapter.id,
                          "hover:bg-slate-100 hover:text-slate-900": currentItemId !== subchapter.id,
                        }
                      )}
                    >
                      <span className="truncate">{subchapter.title}</span>
                      {isSubchapterCompleted && <CheckCircle className="w-3 h-3 text-green-500" />}
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
);

const LessonContent = ({ item, isLocked, courseId }: { item: (Chapter | Subchapter) | null, isLocked: boolean, courseId: string }) => {
  const editor = useEditor({
    extensions: editorExtensions,
    content: item ? parseContent(item.content) : '',
    editable: false,
  });

  useEffect(() => {
    if (editor && item) {
      editor.commands.setContent(parseContent(item.content));
    }
  }, [editor, item]);

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center bg-slate-100 rounded-lg p-8">
        <Lock className="w-16 h-16 text-slate-400 mb-4" />
        <h2 className="text-2xl font-bold mb-2 text-slate-800">This Lesson is Locked</h2>
        <p className="text-slate-600 mb-6">You need to purchase this course to access this lesson.</p>
        <Button onClick={() => window.location.href = `/courses/${courseId}`}>Unlock Course</Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-4xl font-extrabold mb-8 text-slate-900 tracking-tight">{item?.title}</h1>
      <div className="prose prose-lg max-w-none prose-slate">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};

// --- Main Page ---

function CourseStartPageContent({ params }: { params: { courseId: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();

  const [course, setCourse] = useState<Course | null>(null);
  const [currentItemId, setCurrentItemId] = useState<string>('');
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [hasPurchased, setHasPurchased] = useState(false); // Replace with actual purchase check
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchCourseData(params.courseId)
      .then(data => {
        setCourse(data);
        const firstChapter = data.chapters[0];
        if (firstChapter) {
          const firstItem = firstChapter.subchapters.length > 0 ? firstChapter.subchapters[0] : firstChapter;
          setCurrentItemId(firstItem.id);
          setExpandedChapters(new Set([firstChapter.id]));
        }
      })
      .catch(err => {
        toast({ title: "Error", description: "Could not load course content.", variant: "destructive" });
        router.push(`/courses/${params.courseId}`);
      });

    const savedProgress = localStorage.getItem(`progress_${params.courseId}`);
    if (savedProgress) {
      setCompletedItems(new Set(JSON.parse(savedProgress)));
    }
    setHasPurchased(localStorage.getItem(`purchase_${params.courseId}`) === 'true');

  }, [params.courseId, toast, router]);
  
  const handleSelectItem = (itemId: string, isSubchapter: boolean) => {
    setCurrentItemId(itemId);
  };

  const handleToggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const newSet = new Set(prev);
      if (newSet.has(chapterId)) {
        newSet.delete(chapterId);
      } else {
        newSet.add(chapterId);
      }
      return newSet;
    });
  };

  const handleToggleComplete = () => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(currentItemId)) {
      newCompleted.delete(currentItemId);
      toast({ title: "Progress Updated", description: "Item unmarked as complete." });
    } else {
      newCompleted.add(currentItemId);
      toast({ title: "Progress Saved!", description: "Item marked as complete." });
    }
    setCompletedItems(newCompleted);
    localStorage.setItem(`progress_${params.courseId}`, JSON.stringify(Array.from(newCompleted)));
  };

  const { currentItem, isLocked, progress, flatItems, currentIndex } = useMemo(() => {
    if (!course) return { currentItem: null, isLocked: false, progress: 0, flatItems: [], currentIndex: -1 };

    const flatItems: (Chapter | Subchapter)[] = [];
    course.chapters.forEach(ch => {
      flatItems.push(ch);
      ch.subchapters.forEach(sub => flatItems.push(sub));
    });

    const currentItem = flatItems.find(item => item.id === currentItemId) || null;
    const chapterOfCurrentItem = course.chapters.find(ch => 
      ch.id === currentItem?.id || ch.subchapters.some(sub => sub.id === currentItem?.id)
    );
    const isLocked = !!course.price && !(chapterOfCurrentItem?.isFree) && !hasPurchased;
    const progress = (completedItems.size / flatItems.length) * 100;
    const currentIndex = flatItems.findIndex(item => item.id === currentItemId);
    
    return { currentItem, isLocked, progress, flatItems, currentIndex };
  }, [course, currentItemId, completedItems, hasPurchased]);

  const handleNext = () => {
    if (!course || currentIndex < 0) return;
    if (currentIndex < flatItems.length - 1) {
      const nextItem = flatItems[currentIndex + 1];
      const nextChapter = course.chapters.find(ch => ch.id === nextItem.id || ch.subchapters.some(sub => sub.id === nextItem.id));
      if (nextChapter && !expandedChapters.has(nextChapter.id)) {
        handleToggleChapter(nextChapter.id);
      }
      setCurrentItemId(nextItem.id);
    }
  };

  const handlePrev = () => {
    if (!course || currentIndex < 0) return;
    if (currentIndex > 0) {
      const prevItem = flatItems[currentIndex - 1];
      const prevChapter = course.chapters.find(ch => ch.id === prevItem.id || ch.subchapters.some(sub => sub.id === prevItem.id));
       if (prevChapter && !expandedChapters.has(prevChapter.id)) {
        handleToggleChapter(prevChapter.id);
      }
      setCurrentItemId(prevItem.id);
    }
  };

  if (!course) {
    return <div className="flex items-center justify-center h-screen">Loading course...</div>;
  }
  
  const SidebarContent = () => (
     <CourseSidebar
        course={course}
        currentItemId={currentItemId}
        onSelectItem={handleSelectItem}
        completedItems={completedItems}
        hasPurchased={hasPurchased}
        expandedChapters={expandedChapters}
        onToggleChapter={handleToggleChapter}
      />
  );
  
  return (
    <div className="flex h-full bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden">
      <SidebarContent />

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white/80 backdrop-blur-sm p-3 flex-shrink-0">
           <div className="lg:hidden">
             <Sheet>
               <SheetTrigger asChild>
                 <Button variant="outline" size="icon"><Menu className="h-6 w-6 text-slate-600" /></Button>
               </SheetTrigger>
               <SheetContent side="left" className="p-0 w-80 border-r">
                 <SidebarContent />
               </SheetContent>
             </Sheet>
           </div>
          <div className="flex-1 mx-4">
            <Progress value={progress} className="w-full h-2.5" />
            <p className="text-sm text-center mt-1 text-slate-500 font-medium">{Math.round(progress)}% Complete</p>
          </div>
          <Button variant="ghost" className="text-slate-600 hover:bg-slate-100" onClick={() => router.push('/dashboard')}>Exit Course</Button>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
           <div className="max-w-2xl mx-auto">
             <LessonContent item={currentItem} isLocked={isLocked} courseId={params.courseId} />
           </div>
        </div>

        {/* Footer */}
        <footer className="flex justify-between items-center border-t border-slate-200 bg-white/80 backdrop-blur-sm p-3 flex-shrink-0">
          <Button variant="outline" onClick={handlePrev} disabled={currentIndex === 0}>
            Previous Lesson
          </Button>

          <Button 
            onClick={handleToggleComplete} 
            variant={completedItems.has(currentItemId) ? "secondary" : "default"}
            className={clsx("transition-all", {
              "bg-blue-600 hover:bg-blue-700 text-white": !completedItems.has(currentItemId),
            })}
          >
            {completedItems.has(currentItemId) ? "Mark as Incomplete" : "Mark as Complete"}
          </Button>

          <Button onClick={handleNext} disabled={currentIndex === flatItems.length - 1}>
            Next Lesson
          </Button>
        </footer>
      </main>
    </div>
  );
}

export default function CourseStartPage({ params }: { params: Promise<{ courseId: string }> }) {
  const resolvedParams = use(params);
  return (
    <div className="bg-slate-100 p-3 pt-24">
      <div className="h-[calc(100vh-7rem)] max-w-[76.8rem] mx-auto">
        <Suspense fallback={<div className="flex items-center justify-center h-full text-slate-500">Loading Course...</div>}>
          <CourseStartPageContent params={resolvedParams} />
        </Suspense>
      </div>
    </div>
  );
} 
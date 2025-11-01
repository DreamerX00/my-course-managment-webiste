"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { MarkdownDisplay } from "@/components/ui/markdown-display";
import {
  Star,
  Users,
  Clock,
  FileText,
  CheckCircle,
  ArrowRight,
  Video,
  FileCode,
  Trophy,
  MessageSquare,
  Smartphone,
  Lock,
} from "lucide-react";
import { motion } from "framer-motion";

// Utility function to extract YouTube video ID and generate thumbnail URL
function getYouTubeThumbnail(input: string | null): string | null {
  if (!input) return null;

  // If it's already an image URL, return it
  if (input.match(/\.(jpg|jpeg|png|gif|webp)/i)) {
    return input;
  }

  let videoId: string | null = null;

  // Extract from iframe embed code
  const iframeMatch = input.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (iframeMatch) {
    videoId = iframeMatch[1];
  }

  // Extract from regular YouTube URL (watch?v=)
  if (!videoId) {
    const urlMatch = input.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (urlMatch) {
      videoId = urlMatch[1];
    }
  }

  // Extract from youtu.be short URL
  if (!videoId) {
    const shortMatch = input.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
    if (shortMatch) {
      videoId = shortMatch[1];
    }
  }

  // Extract from embed URL directly
  if (!videoId) {
    const embedMatch = input.match(/\/embed\/([a-zA-Z0-9_-]+)/);
    if (embedMatch) {
      videoId = embedMatch[1];
    }
  }

  // If we found a video ID, return the thumbnail URL
  if (videoId) {
    // Use maxresdefault for best quality, fallback to hqdefault
    return `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  }

  // If it looks like a URL, return it as-is
  if (input.startsWith("http")) {
    return input;
  }

  return null;
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
  id: string;
  title: string;
  chapters: Chapter[];
  price: number | null;
  thumbnail: string | null;
}

// Content details interface
interface ContentDetails {
  title: string;
  category: string;
  tags: string[];
  instructor: {
    name: string;
    avatar: string;
    rating: number;
    students: number;
  };
  rating: number;
  enrolledCount: number;
  duration: string;
  price: number;
  originalPrice: number;
  isFree: boolean;
  description: string;
  features: Array<{
    icon: string;
    title: string;
    description: string;
    value: string;
  }>;
}

// Create empty content details (shows N/A for missing data)
const createEmptyContentDetails = (courseTitle: string): ContentDetails => ({
  title: courseTitle,
  category: "N/A",
  tags: [],
  instructor: {
    name: "N/A",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 0,
    students: 0,
  },
  rating: 0,
  enrolledCount: 0,
  duration: "N/A",
  price: 0,
  originalPrice: 0,
  isFree: true,
  description: `<p>No description available.</p>`,
  features: [],
});

function CourseHero({
  contentDetails,
  courseThumbnail,
}: {
  contentDetails: ContentDetails;
  courseThumbnail: string | null;
}) {
  // Process the thumbnail to handle YouTube URLs/embeds
  const thumbnailUrl =
    getYouTubeThumbnail(courseThumbnail) ||
    "https://images.unsplash.com/photo-1517694712202-14dd953bb09f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  return (
    <div className="relative bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Mobile: Thumbnail First, Content Below */}
        {/* Desktop: Side by Side */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Course Thumbnail - Show First on Mobile */}
          <div className="w-full lg:hidden order-first">
            <div className="relative rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={thumbnailUrl}
                alt={contentDetails.title}
                width={600}
                height={400}
                className="w-full h-56 sm:h-64 object-cover"
                priority
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1">
            <div className="space-y-3 sm:space-y-4">
              {contentDetails.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {contentDetails.tags.map((tag: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 hover:bg-blue-200 text-xs sm:text-sm"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 leading-tight"
              >
                {contentDetails.title}
              </motion.h1>

              {contentDetails.description &&
                contentDetails.description !==
                  "<p>No description available.</p>" && (
                  <p className="text-base sm:text-lg text-gray-600 line-clamp-3">
                    {contentDetails.description
                      .replaceAll(/<[^>]*>/g, "")
                      .substring(0, 200)}
                    ...
                  </p>
                )}
            </div>

            {/* Instructor Info */}
            {contentDetails.instructor.name !== "N/A" && (
              <div className="flex items-center gap-3 sm:gap-4 bg-white/50 backdrop-blur-sm p-4 rounded-lg">
                {contentDetails.instructor.avatar && (
                  <Image
                    src={contentDetails.instructor.avatar}
                    alt={contentDetails.instructor.name}
                    width={56}
                    height={56}
                    className="rounded-full object-cover w-12 h-12 sm:w-14 sm:h-14 border-2 border-white shadow-md"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                    {contentDetails.instructor.name}
                  </p>
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 flex-wrap">
                    {contentDetails.instructor.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                        <span>{contentDetails.instructor.rating}</span>
                      </div>
                    )}
                    {contentDetails.instructor.students > 0 && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>
                          {contentDetails.instructor.students.toLocaleString()}{" "}
                          students
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Course Stats */}
            <div className="flex flex-wrap gap-4 sm:gap-6 text-xs sm:text-sm">
              {contentDetails.rating > 0 && (
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{contentDetails.rating}</span>
                  {contentDetails.enrolledCount > 0 && (
                    <span className="text-gray-600">
                      ({contentDetails.enrolledCount.toLocaleString()} enrolled)
                    </span>
                  )}
                </div>
              )}
              {contentDetails.duration !== "N/A" && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                  <span>{contentDetails.duration}</span>
                </div>
              )}
            </div>
          </div>

          {/* Course Thumbnail - Desktop Only (Hidden on Mobile) */}
          <div className="hidden lg:block lg:col-span-1 order-3 lg:order-2">
            <div className="sticky top-24">
              <div className="relative rounded-xl overflow-hidden shadow-2xl">
                <Image
                  src={thumbnailUrl}
                  alt={contentDetails.title}
                  width={400}
                  height={256}
                  className="w-full h-48 lg:h-64 object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CourseDescription({
  contentDetails,
}: {
  contentDetails: ContentDetails;
}) {
  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose dark:prose-invert prose-sm sm:prose-base lg:prose-lg max-w-none"
        >
          <MarkdownDisplay content={contentDetails.description} />
        </motion.div>
      </div>
    </div>
  );
}

// Icon mapping for features
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Video,
  FileCode,
  Trophy,
  MessageSquare,
  Smartphone,
  Lock,
  FileText,
  Clock,
  CheckCircle,
  Users,
  Star,
};

function CourseFeatures({
  contentDetails,
}: {
  contentDetails: ContentDetails;
}) {
  // Don't render if no features
  if (!contentDetails.features || contentDetails.features.length === 0) {
    return null;
  }

  return (
    <div className="py-8 sm:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            What&apos;s Included
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Everything you need to master this course
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {contentDetails.features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || Star;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="shrink-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">
                          {feature.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600 mb-2">
                          {feature.description}
                        </p>
                        <p className="text-xs sm:text-sm font-medium text-blue-600">
                          {feature.value}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function CourseCurriculum({ course }: { course: Course }) {
  return (
    <div className="py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 sm:mb-4">
            Course Curriculum
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            What you&apos;ll learn in this course
          </p>
        </motion.div>

        <div className="space-y-3 sm:space-y-4">
          {course.chapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between gap-3 sm:gap-4">
                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="font-semibold text-blue-600 text-sm sm:text-base">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate">
                          {chapter.title}
                        </h3>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {chapter.subchapters.length} lessons
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {chapter.isFree ? (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800 text-xs"
                        >
                          Free
                        </Badge>
                      ) : (
                        <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                      )}
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hidden sm:block" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PricingCard({
  contentDetails,
  courseId,
}: {
  contentDetails: ContentDetails;
  courseId: string;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [checkingEnrollment, setCheckingEnrollment] = useState(true);

  // Check enrollment status on mount
  useEffect(() => {
    const checkEnrollment = async () => {
      if (!session) {
        setCheckingEnrollment(false);
        return;
      }

      try {
        const response = await fetch(`/api/courses/${courseId}/enroll`);
        if (response.ok) {
          const data = await response.json();
          setIsEnrolled(data.enrolled);
        }
      } catch (error) {
        console.error("Failed to check enrollment:", error);
      } finally {
        setCheckingEnrollment(false);
      }
    };

    checkEnrollment();
  }, [courseId, session]);

  const handleEnroll = async () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to enroll in this course.",
        variant: "destructive",
      });
      router.push("/login");
      return;
    }

    setEnrolling(true);
    try {
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to enroll");
      }

      await response.json();
      setIsEnrolled(true);

      toast({
        title: "Enrollment Successful!",
        description:
          "You have been enrolled in the course. Let's start learning!",
      });

      // Redirect to learning page after a short delay
      setTimeout(() => {
        router.push(`/courses/${courseId}/learn`);
      }, 1000);
    } catch (error) {
      toast({
        title: "Enrollment Failed",
        description:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleStartCourse = () => {
    router.push(`/courses/${courseId}/learn`);
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-xl sm:rounded-2xl shadow-xl p-6 sm:p-8 flex flex-col items-center space-y-6 sm:space-y-8 border border-gray-100">
      <div className="w-full text-center mb-2 sm:mb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
          Ready to Get Started?
        </h2>
        <p className="text-sm sm:text-base text-gray-600">
          Join thousands of students learning this course
        </p>
      </div>

      <div className="w-full flex flex-col items-center space-y-4 sm:space-y-6">
        <div className="w-full text-center">
          {contentDetails.isFree || contentDetails.price === 0 ? (
            <div className="text-2xl sm:text-3xl font-bold text-green-600 mb-2">
              Free
            </div>
          ) : contentDetails.price > 0 ? (
            <div className="space-y-1">
              <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                ₹{contentDetails.price}
              </div>
              {contentDetails.originalPrice > contentDetails.price && (
                <div className="text-base sm:text-lg text-gray-500 line-through">
                  ₹{contentDetails.originalPrice}
                </div>
              )}
            </div>
          ) : (
            <div className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">
              Price Not Set
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {contentDetails.price > 0 ? "One-time payment" : ""}
          </p>
        </div>

        <div className="w-full space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0" />
            <span>Full lifetime access</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0" />
            <span>Access on mobile and TV</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0" />
            <span>Certificate of completion</span>
          </div>
          <div className="flex items-center gap-2 text-xs sm:text-sm">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 shrink-0" />
            <span>30-day money-back guarantee</span>
          </div>
        </div>

        <div className="w-full flex flex-col space-y-3 pt-2">
          {checkingEnrollment ? (
            <Button
              disabled
              className="w-full bg-gray-400 text-white py-3 text-lg font-semibold cursor-not-allowed"
            >
              Checking enrollment...
            </Button>
          ) : isEnrolled ? (
            <Button
              onClick={handleStartCourse}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 text-lg font-semibold"
            >
              Continue Learning <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          ) : session ? (
            <Button
              onClick={handleEnroll}
              disabled={enrolling}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enrolling
                ? "Enrolling..."
                : contentDetails.isFree
                ? "Enroll for Free"
                : "Enroll Now"}
            </Button>
          ) : (
            <Button
              onClick={() => router.push("/login")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
            >
              Sign In to Enroll
            </Button>
          )}
          <Button variant="outline" className="w-full py-3 text-lg">
            Add to Wishlist
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CourseDetailsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [contentDetails, setContentDetails] = useState<ContentDetails | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch course data
        const courseResponse = await fetch(`/api/courses/${courseId}`);
        if (!courseResponse.ok) {
          throw new Error("Failed to fetch course data");
        }
        const courseData = await courseResponse.json();
        setCourse(courseData);

        // Fetch content details
        try {
          const detailsResponse = await fetch(
            `/api/admin/courses/${courseId}/details`
          );
          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            setContentDetails(detailsData);
          } else {
            // Create empty content details with course title
            setContentDetails(createEmptyContentDetails(courseData.title));
          }
        } catch {
          // Create empty content details with course title
          setContentDetails(createEmptyContentDetails(courseData.title));
        }
      } catch {
        setError("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Course Not Found
          </h1>
          <p className="text-gray-600 mb-4">
            {error || "The course you are looking for does not exist."}
          </p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  if (!contentDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading course details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <CourseHero
        contentDetails={contentDetails}
        courseThumbnail={course.thumbnail}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <CourseDescription contentDetails={contentDetails} />
            <CourseFeatures contentDetails={contentDetails} />
            <CourseCurriculum course={course} />
          </div>
          {/* Pricing Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28">
              <PricingCard
                contentDetails={contentDetails}
                courseId={courseId}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { 
  Star, 
  Users, 
  Clock, 
  FileText, 
  Download, 
  Award, 
  MessageSquare, 
  Smartphone, 
  Lock, 
  Play,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Video,
  FileCode,
  Trophy
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { EditorContent, useEditor } from '@tiptap/react';
import { editorExtensions } from "@/lib/tiptap-extensions";
import { motion } from "framer-motion";
import clsx from "clsx";

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

// Default content details template (fallback)
const defaultContentDetails: ContentDetails = {
  title: "DSA Cracker 🔥 - Complete Data Structures & Algorithms",
  category: "Computer Science",
  tags: ["DSA", "Beginner", "Interview Prep", "Popular"],
  instructor: {
    name: "CodeWithHarry",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 4.8,
    students: 15420
  },
  rating: 4.9,
  enrolledCount: 28450,
  duration: "45 hours",
  price: 999,
  originalPrice: 1999,
  isFree: false,
  description: `
    <h2>Master Data Structures and Algorithms</h2>
    <p>This comprehensive course will take you from a complete beginner to an advanced DSA expert.</p>
  `,
  features: [
    {
      icon: "Video",
      title: "Video Content",
      description: "45 hours of on-demand videos",
      value: "45 hours"
    },
    {
      icon: "FileText",
      title: "Resources",
      description: "Downloadable resources and notes",
      value: "50+ files"
    },
    {
      icon: "FileCode",
      title: "Assignments",
      description: "Practice problems and coding challenges",
      value: "200+ problems"
    },
    {
      icon: "MessageSquare",
      title: "Instructor Support",
      description: "Direct Q&A and doubt solving",
      value: "24/7 support"
    },
    {
      icon: "Smartphone",
      title: "Access",
      description: "Full lifetime access on mobile & TV",
      value: "Lifetime"
    },
    {
      icon: "Trophy",
      title: "Certificate",
      description: "Certificate of Completion included",
      value: "Included"
    }
  ]
};

// Icon mapping for features
const iconMap: { [key: string]: any } = {
  Video,
  FileText,
  FileCode,
  MessageSquare,
  Smartphone,
  Trophy
};

function CourseHero({ contentDetails }: { contentDetails: ContentDetails }) {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {contentDetails.tags.map((tag: string, index: number) => (
                  <Badge key={index} variant="secondary" className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight"
              >
                {contentDetails.title}
              </motion.h1>
              
              <p className="text-lg text-gray-600">
                Master Data Structures and Algorithms for interviews and competitive programming
              </p>
            </div>

            {/* Instructor Info */}
            <div className="flex items-center gap-4">
              <img 
                src={contentDetails.instructor.avatar} 
                alt={contentDetails.instructor.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-gray-900">{contentDetails.instructor.name}</p>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{contentDetails.instructor.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{contentDetails.instructor.students.toLocaleString()} students</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Stats */}
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold">{contentDetails.rating}</span>
                <span className="text-gray-600">({contentDetails.enrolledCount.toLocaleString()} enrolled)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-500" />
                <span>{contentDetails.duration}</span>
              </div>
            </div>
          </div>

          {/* Course Thumbnail */}
          <div className="lg:col-span-1">
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1517694712202-14dd953bb09f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" 
                alt={contentDetails.title}
                className="w-full h-48 lg:h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function CourseDescription({ contentDetails }: { contentDetails: ContentDetails }) {
  const editor = useEditor({
    extensions: editorExtensions,
    content: contentDetails.description,
    editable: false,
    immediatelyRender: false,
  })

  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="prose prose-lg max-w-none"
        >
          <EditorContent editor={editor} />
        </motion.div>
      </div>
    </div>
  )
}

function CourseFeatures({ contentDetails }: { contentDetails: ContentDetails }) {
  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">What's Included</h2>
          <p className="text-lg text-gray-600">Everything you need to master this course</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contentDetails.features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon];
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                        <p className="text-sm font-medium text-blue-600">{feature.value}</p>
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
  )
}

function CourseCurriculum({ course }: { course: Course }) {
  return (
    <div className="py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Course Curriculum</h2>
          <p className="text-lg text-gray-600">What you'll learn in this course</p>
        </motion.div>

        <div className="space-y-4">
          {course.chapters.map((chapter, index) => (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 * index }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{chapter.title}</h3>
                        <p className="text-sm text-gray-600">{chapter.subchapters.length} lessons</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {chapter.isFree ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Free
                        </Badge>
                      ) : (
                        <Lock className="w-5 h-5 text-gray-400" />
                      )}
                      <ArrowRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

function PricingCard({ contentDetails, courseId }: { contentDetails: ContentDetails; courseId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const { toast } = useToast();

  const handleEnroll = () => {
    if (!session) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to enroll in this course.",
        variant: "destructive",
      });
      return;
    }

    // Handle enrollment logic here
    toast({
      title: "Enrollment Successful!",
      description: "You have been enrolled in the course.",
    });
  };

  const handleStartCourse = () => {
    router.push(`/courses/${courseId}/start`);
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center space-y-8 border border-gray-100">
      <div className="w-full text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready to Get Started?</h2>
        <p className="text-base text-gray-600">Join thousands of students learning this course</p>
      </div>

      <div className="w-full flex flex-col items-center space-y-6">
        <div className="w-full text-center">
          {contentDetails.isFree ? (
            <div className="text-3xl font-bold text-green-600 mb-2">Free</div>
          ) : (
            <div className="space-y-1">
              <div className="text-3xl font-bold text-gray-900">₹{contentDetails.price}</div>
              <div className="text-lg text-gray-500 line-through">₹{contentDetails.originalPrice}</div>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">One-time payment</p>
        </div>

        <div className="w-full space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Full lifetime access</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Access on mobile and TV</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>Certificate of completion</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <span>30-day money-back guarantee</span>
          </div>
        </div>

        <div className="w-full flex flex-col space-y-3 pt-2">
          {session ? (
            <Button 
              onClick={handleStartCourse}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
            >
              Continue Learning
            </Button>
          ) : (
            <Button 
              onClick={handleEnroll}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold"
            >
              {contentDetails.isFree ? 'Enroll for Free' : 'Enroll Now'}
            </Button>
          )}
          <Button 
            variant="outline" 
            className="w-full py-3 text-lg"
          >
            Add to Wishlist
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CourseDetailsPage({ params }: { params: { courseId: string } }) {
  const [course, setCourse] = useState<Course | null>(null);
  const [contentDetails, setContentDetails] = useState<ContentDetails>(defaultContentDetails);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch course data
        const courseResponse = await fetch(`/api/courses/${params.courseId}`);
        if (!courseResponse.ok) {
          throw new Error('Failed to fetch course data');
        }
        const courseData = await courseResponse.json();
        setCourse(courseData);

        // Fetch content details
        try {
          const detailsResponse = await fetch(`/api/admin/courses/${params.courseId}/details`);
          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            setContentDetails(detailsData);
          }
        } catch (error) {
          console.error('Error fetching content details:', error);
          // Use default content details if fetch fails
        }
      } catch (error) {
        setError('Failed to load course data');
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.courseId]);

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
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Course Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The course you are looking for does not exist.'}</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <CourseHero contentDetails={contentDetails} />
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
              <PricingCard contentDetails={contentDetails} courseId={params.courseId} />
              </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
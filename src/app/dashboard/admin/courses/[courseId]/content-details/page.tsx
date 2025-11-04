"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useRouter, useParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useSession } from "next-auth/react";
import {
  Save,
  RotateCcw,
  ArrowLeft,
  Plus,
  X,
  FileText,
  Clock,
  Users,
  Star,
  Video,
  FileCode,
  MessageSquare,
  Smartphone,
  Trophy,
  BookOpen,
} from "lucide-react";
import { ToastEditor, ToastEditorHandle } from "@/components/ui/toast-editor";

interface Feature {
  icon: string;
  title: string;
  description: string;
  value: string;
}

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
  features: Feature[];
}

// Empty template for new courses
const createEmptyContentDetails = (): ContentDetails => ({
  title: "",
  category: "",
  tags: [],
  instructor: {
    name: "",
    avatar: "",
    rating: 0,
    students: 0,
  },
  rating: 0,
  enrolledCount: 0,
  duration: "",
  price: 0,
  originalPrice: 0,
  isFree: true,
  description: "",
  features: [],
});

const iconMap = {
  Video,
  FileText,
  FileCode,
  MessageSquare,
  Smartphone,
  Trophy,
  BookOpen,
  Clock,
  Users,
  Star,
};

export default function CourseContentDetailsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter();
  const { toast } = useToast();
  const { data: session } = useSession();
  const [contentDetails, setContentDetails] = useState(
    createEmptyContentDetails()
  );
  const [courseThumbnail, setCourseThumbnail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newTag, setNewTag] = useState("");
  const [newFeature, setNewFeature] = useState({
    icon: "Video",
    title: "",
    description: "",
    value: "",
  });

  // Editor ref for Toast UI Editor
  const editorRef = useRef<ToastEditorHandle>(null);

  // Fetch course details on mount
  useEffect(() => {
    const fetchCourseDetails = async () => {
      if (!courseId) return;

      try {
        setLoading(true);

        // Fetch basic course info (no cache for admin)
        const courseResponse = await fetch(`/api/courses/${courseId}`, {
          cache: "no-store",
        });

        if (!courseResponse.ok) {
          throw new Error("Failed to fetch course details");
        }

        const courseData = await courseResponse.json();

        // Set course thumbnail
        setCourseThumbnail(courseData.thumbnail || "");

        // Try to fetch detailed content from the details endpoint
        try {
          const detailsResponse = await fetch(
            `/api/admin/courses/${courseId}/details`,
            {
              cache: "no-store", // Disable cache for admin
            }
          );

          if (detailsResponse.ok) {
            const detailsData = await detailsResponse.json();
            setContentDetails(detailsData);
          } else {
            // Details not found, create empty template
            const instructorInfo = session?.user
              ? {
                  name: session.user.name || "Instructor",
                  avatar:
                    session.user.image || "https://via.placeholder.com/150",
                  rating: 4.8,
                  students: 0,
                }
              : {
                  name: "",
                  avatar: "https://via.placeholder.com/150",
                  rating: 0,
                  students: 0,
                };

            setContentDetails({
              ...createEmptyContentDetails(),
              title: courseData.title || "",
              price: courseData.price || 0,
              isFree: !courseData.price || courseData.price === 0,
              instructor: instructorInfo,
            });
          }
        } catch (detailsError) {
          console.error("Error fetching details:", detailsError);
          // Fallback to empty template
          const instructorInfo = session?.user
            ? {
                name: session.user.name || "Instructor",
                avatar: session.user.image || "https://via.placeholder.com/150",
                rating: 4.8,
                students: 0,
              }
            : {
                name: "",
                avatar: "https://via.placeholder.com/150",
                rating: 0,
                students: 0,
              };

          setContentDetails({
            ...createEmptyContentDetails(),
            title: courseData.title || "",
            price: courseData.price || 0,
            isFree: !courseData.price || courseData.price === 0,
            instructor: instructorInfo,
          });
        }
      } catch (err) {
        console.error("Error fetching course details:", err);
        setError("Failed to load course details");
        toast({
          title: "Error",
          description: "Failed to load course details. Using empty template.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourseDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, toast]);

  const handleSave = async () => {
    if (!courseId) return;
    setSaving(true);
    setError(null);

    // Get markdown content from editor
    const markdownContent =
      editorRef.current?.getMarkdown() || contentDetails.description;

    try {
      // Save content details
      const response = await fetch(`/api/admin/courses/${courseId}/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...contentDetails,
          description: markdownContent,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save content details");
      }

      // Update course thumbnail if changed
      if (courseThumbnail) {
        const courseResponse = await fetch(`/api/courses/${courseId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            thumbnail: courseThumbnail,
          }),
        });

        if (!courseResponse.ok) {
          throw new Error("Failed to update course thumbnail");
        }
      }

      toast({
        title: "Success",
        description: "Content details saved successfully!",
      });
    } catch {
      setError("Failed to save content details");
      toast({
        title: "Error",
        description: "Failed to save content details. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const emptyDetails = createEmptyContentDetails();
    setContentDetails(emptyDetails);
    // Editor content will update via props, no need to manually set
    toast({
      title: "Reset",
      description: "Content details reset to empty template.",
    });
  };

  const addTag = () => {
    if (newTag.trim() && !contentDetails.tags.includes(newTag.trim())) {
      setContentDetails((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setContentDetails((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const addFeature = () => {
    if (newFeature.title && newFeature.description && newFeature.value) {
      setContentDetails((prev) => ({
        ...prev,
        features: [...prev.features, { ...newFeature }],
      }));
      setNewFeature({
        icon: "Video",
        title: "",
        description: "",
        value: "",
      });
    }
  };

  const removeFeature = (index: number) => {
    setContentDetails((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-yellow-50 to-pink-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading content details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-yellow-50 to-pink-50 p-8 pt-24">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Manage Content Details
              </h1>
              <p className="text-gray-600">Course ID: {courseId}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
          >
            {error}
          </motion.div>
        )}

        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    value={contentDetails.title}
                    onChange={(e) =>
                      setContentDetails((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Enter course title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={contentDetails.category}
                    onChange={(e) =>
                      setContentDetails((prev) => ({
                        ...prev,
                        category: e.target.value,
                      }))
                    }
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="thumbnail">Course Thumbnail URL</Label>
                <Input
                  id="thumbnail"
                  value={courseThumbnail}
                  onChange={(e) => setCourseThumbnail(e.target.value)}
                  placeholder="https://example.com/image.jpg or https://www.youtube.com/watch?v=VIDEO_ID"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Supported formats:
                  <br />• Direct image URL (e.g., https://example.com/image.jpg)
                  <br />• YouTube watch URL (e.g.,
                  https://www.youtube.com/watch?v=nNnc1gLUgp4)
                  <br />• YouTube embed URL (e.g.,
                  https://www.youtube.com/embed/nNnc1gLUgp4)
                  <br />• YouTube short URL (e.g., https://youtu.be/nNnc1gLUgp4)
                  <br />• YouTube iframe embed code (will extract thumbnail
                  automatically)
                </p>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {contentDetails.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add new tag"
                    onKeyPress={(e) => e.key === "Enter" && addTag()}
                  />
                  <Button onClick={addTag} variant="outline" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Instructor Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Instructor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instructorName">Instructor Name</Label>
                  <Input
                    id="instructorName"
                    value={contentDetails.instructor.name}
                    onChange={(e) =>
                      setContentDetails((prev) => ({
                        ...prev,
                        instructor: {
                          ...prev.instructor,
                          name: e.target.value,
                        },
                      }))
                    }
                    placeholder="Instructor name"
                  />
                </div>
                <div>
                  <Label htmlFor="instructorAvatar">Avatar URL</Label>
                  <Input
                    id="instructorAvatar"
                    value={contentDetails.instructor.avatar}
                    onChange={(e) =>
                      setContentDetails((prev) => ({
                        ...prev,
                        instructor: {
                          ...prev.instructor,
                          avatar: e.target.value,
                        },
                      }))
                    }
                    placeholder="Avatar image URL"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="instructorRating">Instructor Rating</Label>
                  <Input
                    id="instructorRating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={contentDetails.instructor.rating}
                    onChange={(e) =>
                      setContentDetails((prev) => ({
                        ...prev,
                        instructor: {
                          ...prev.instructor,
                          rating: parseFloat(e.target.value),
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="instructorStudents">Student Count</Label>
                  <Input
                    id="instructorStudents"
                    type="number"
                    value={contentDetails.instructor.students}
                    onChange={(e) =>
                      setContentDetails((prev) => ({
                        ...prev,
                        instructor: {
                          ...prev.instructor,
                          students: parseInt(e.target.value),
                        },
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="courseRating">Course Rating</Label>
                  <Input
                    id="courseRating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={contentDetails.rating}
                    onChange={(e) =>
                      setContentDetails((prev) => ({
                        ...prev,
                        rating: parseFloat(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Course Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={contentDetails.duration}
                    onChange={(e) =>
                      setContentDetails((prev) => ({
                        ...prev,
                        duration: e.target.value,
                      }))
                    }
                    placeholder="e.g., 45 hours"
                  />
                </div>
                <div>
                  <Label htmlFor="enrolledCount">Enrolled Count</Label>
                  <Input
                    id="enrolledCount"
                    type="number"
                    value={contentDetails.enrolledCount}
                    onChange={(e) =>
                      setContentDetails((prev) => ({
                        ...prev,
                        enrolledCount: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={contentDetails.price}
                    onChange={(e) =>
                      setContentDetails((prev) => ({
                        ...prev,
                        price: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="originalPrice">Original Price (₹)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={contentDetails.originalPrice}
                    onChange={(e) =>
                      setContentDetails((prev) => ({
                        ...prev,
                        originalPrice: parseInt(e.target.value),
                      }))
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="isFree"
                    type="checkbox"
                    checked={contentDetails.isFree}
                    onChange={(e) =>
                      setContentDetails((prev) => ({
                        ...prev,
                        isFree: e.target.checked,
                      }))
                    }
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isFree">Free Course</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Course Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {contentDetails.features.map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                      <select
                        value={feature.icon}
                        onChange={(e) => {
                          const newFeatures = [...contentDetails.features];
                          newFeatures[index].icon = e.target.value;
                          setContentDetails((prev) => ({
                            ...prev,
                            features: newFeatures,
                          }));
                        }}
                        className="border rounded px-2 py-1"
                      >
                        {Object.keys(iconMap).map((iconName) => (
                          <option key={iconName} value={iconName}>
                            {iconName}
                          </option>
                        ))}
                      </select>
                      <Input
                        value={feature.title}
                        onChange={(e) => {
                          const newFeatures = [...contentDetails.features];
                          newFeatures[index].title = e.target.value;
                          setContentDetails((prev) => ({
                            ...prev,
                            features: newFeatures,
                          }));
                        }}
                        placeholder="Feature title"
                      />
                      <Input
                        value={feature.description}
                        onChange={(e) => {
                          const newFeatures = [...contentDetails.features];
                          newFeatures[index].description = e.target.value;
                          setContentDetails((prev) => ({
                            ...prev,
                            features: newFeatures,
                          }));
                        }}
                        placeholder="Feature description"
                      />
                      <Input
                        value={feature.value}
                        onChange={(e) => {
                          const newFeatures = [...contentDetails.features];
                          newFeatures[index].value = e.target.value;
                          setContentDetails((prev) => ({
                            ...prev,
                            features: newFeatures,
                          }));
                        }}
                        placeholder="Value (e.g., 45 hours)"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-3">
                <h4 className="font-semibold">Add New Feature</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <select
                    value={newFeature.icon}
                    onChange={(e) =>
                      setNewFeature((prev) => ({
                        ...prev,
                        icon: e.target.value,
                      }))
                    }
                    className="border rounded px-2 py-1"
                  >
                    {Object.keys(iconMap).map((iconName) => (
                      <option key={iconName} value={iconName}>
                        {iconName}
                      </option>
                    ))}
                  </select>
                  <Input
                    value={newFeature.title}
                    onChange={(e) =>
                      setNewFeature((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Feature title"
                  />
                  <Input
                    value={newFeature.description}
                    onChange={(e) =>
                      setNewFeature((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Feature description"
                  />
                  <Input
                    value={newFeature.value}
                    onChange={(e) =>
                      setNewFeature((prev) => ({
                        ...prev,
                        value: e.target.value,
                      }))
                    }
                    placeholder="Value"
                  />
                </div>
                <Button
                  onClick={addFeature}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Feature
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Course Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ToastEditor
                key={courseId}
                ref={editorRef}
                content={contentDetails.description}
                height="400px"
                placeholder="Enter course description in Markdown..."
                onSave={({ markdown }) =>
                  setContentDetails((prev) => ({
                    ...prev,
                    description: markdown,
                  }))
                }
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { motion, Reorder } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Search, GripVertical, X, Users, Clock } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  rating: number;
  enrolledCount: number;
  duration: string;
  thumbnail: string;
  price: number;
}

interface FeaturedCourseSelectorProps {
  selectedCourses: string[];
  onUpdate: (courseIds: string[]) => void;
}

export function FeaturedCourseSelector({
  selectedCourses,
  onUpdate,
}: FeaturedCourseSelectorProps) {
  const { toast } = useToast();
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/courses");
      if (response.ok) {
        const data = await response.json();
        setCourses(data);
      } else {
        toast({
          title: "Error",
          description: "Failed to load courses. Please refresh the page.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      toast({
        title: "Error",
        description: "Failed to load courses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredCourses = courses.filter(
    (course) =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCourseObjects = courses.filter((course) =>
    selectedCourses.includes(course.id)
  );

  const addCourse = (courseId: string) => {
    if (selectedCourses.length >= 4) {
      toast({
        title: "Limit Reached",
        description:
          "You can only select 4 featured courses. Remove one first.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedCourses.includes(courseId)) {
      onUpdate([...selectedCourses, courseId]);
      toast({
        title: "Success",
        description: "Course added to featured list.",
      });
    }
  };

  const removeCourse = (courseId: string) => {
    onUpdate(selectedCourses.filter((id) => id !== courseId));
    toast({
      title: "Success",
      description: "Course removed from featured list.",
    });
  };

  const handleReorder = (newOrder: Course[]) => {
    const newOrderIds = newOrder.map((course) => course.id);
    onUpdate(newOrderIds);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Featured Courses
          </CardTitle>
          <p className="text-sm text-gray-600">
            Select exactly 4 courses to be featured on the homepage. Drag to
            reorder.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Selected Courses */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Selected Featured Courses ({selectedCourseObjects.length}/4)
            </Label>

            {selectedCourseObjects.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                <Star className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No courses selected yet.</p>
                <p className="text-sm">Choose courses from the list below.</p>
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={selectedCourseObjects}
                onReorder={handleReorder}
                className="space-y-3"
              >
                {selectedCourseObjects.map((course) => (
                  <Reorder.Item
                    key={course.id}
                    value={course}
                    className="relative"
                  >
                    <motion.div
                      layout
                      className="flex items-center gap-4 p-4 bg-linear-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg shadow-sm"
                    >
                      <GripVertical className="h-5 w-5 text-gray-400 cursor-grab active:cursor-grabbing" />

                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        width={64}
                        height={48}
                        className="w-16 h-12 object-cover rounded-md"
                      />

                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 line-clamp-1">
                          {course.title}
                        </h4>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          by {course.instructor}
                        </p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            {course.rating}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {course.enrolledCount.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {course.duration}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCourse(course.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </motion.div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </div>

          {/* Course Selection */}
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <Label htmlFor="searchCourses">Search Courses</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="searchCourses"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search by title or instructor..."
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {filteredCourses.length} courses found
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600">Loading courses...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                {filteredCourses
                  .filter((course) => !selectedCourses.includes(course.id))
                  .map((course) => (
                    <motion.div
                      key={course.id}
                      layout
                      className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
                      onClick={() => addCourse(course.id)}
                    >
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        width={400}
                        height={96}
                        className="w-full h-24 object-cover rounded-md mb-3"
                      />
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-1">
                        {course.title}
                      </h4>
                      <p className="text-xs text-gray-600 mb-2">
                        by {course.instructor}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{course.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>{course.enrolledCount.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {course.duration} • ₹{course.price}
                      </div>
                    </motion.div>
                  ))}
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">
              Featured Courses Guidelines:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Select exactly 4 courses to be featured on the homepage</li>
              <li>• Drag and drop to reorder the display sequence</li>
              <li>
                • Choose courses with high ratings and enrollment for best
                results
              </li>
              <li>
                • Featured courses appear in the &quot;Our Popular Courses&quot;
                section
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

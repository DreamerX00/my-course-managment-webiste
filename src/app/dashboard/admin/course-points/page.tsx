"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  isPublished: boolean;
  chapterCount: number;
  pointsConfiguration: {
    totalPoints: number;
    pointsPerChapter: number;
    difficulty: string;
    assignedBy: string;
    assignedAt: Date;
    updatedAt: Date;
  } | null;
}

const DIFFICULTY_INFO = {
  BEGINNER: {
    label: "Beginner",
    range: "1,000 - 3,000",
    color: "bg-green-500",
    description: "Basic concepts, short courses",
  },
  INTERMEDIATE: {
    label: "Intermediate",
    range: "3,000 - 8,000",
    color: "bg-blue-500",
    description: "Moderate complexity, standard length",
  },
  ADVANCED: {
    label: "Advanced",
    range: "8,000 - 15,000",
    color: "bg-purple-500",
    description: "Complex topics, longer courses",
  },
  EXPERT: {
    label: "Expert",
    range: "15,000 - 30,000",
    color: "bg-red-500",
    description: "Mastery level, comprehensive courses",
  },
};

export default function CoursePointsManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCourse, setEditingCourse] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    totalPoints: "",
    difficulty: "INTERMEDIATE",
    adminNotes: "",
  });
  const { toast } = useToast();

  const fetchCourses = async () => {
    try {
      const res = await fetch("/api/admin/course-points");
      const data = await res.json();

      if (data.success) {
        setCourses(data.courses);
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch courses",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to fetch courses",
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

  const handleEdit = (course: Course) => {
    setEditingCourse(course.id);
    setFormData({
      totalPoints: course.pointsConfiguration?.totalPoints?.toString() || "",
      difficulty: course.pointsConfiguration?.difficulty || "INTERMEDIATE",
      adminNotes: "",
    });
  };

  const handleSave = async (courseId: string) => {
    try {
      const res = await fetch("/api/admin/course-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          totalPoints: parseInt(formData.totalPoints),
          difficulty: formData.difficulty,
          adminNotes: formData.adminNotes || undefined,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Course points updated successfully",
        });
        setEditingCourse(null);
        fetchCourses();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to update course points",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to update course points",
        variant: "destructive",
      });
    }
  };
  const handleDelete = async (courseId: string) => {
    if (
      !confirm(
        "Are you sure you want to remove points configuration for this course?"
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/course-points?courseId=${courseId}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (data.success) {
        toast({
          title: "Success",
          description: "Points configuration removed",
        });
        fetchCourses();
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to delete configuration",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete configuration",
        variant: "destructive",
      });
    }
  };
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Course Points Management</h1>
        <p className="text-muted-foreground mt-2">
          Assign points to courses based on difficulty and length. Points are
          automatically distributed across chapters.
        </p>
      </div>

      {/* Difficulty Guide */}
      <Card>
        <CardHeader>
          <CardTitle>Difficulty Guidelines</CardTitle>
          <CardDescription>
            Recommended point ranges for each difficulty level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(DIFFICULTY_INFO).map(([key, info]) => (
              <div key={key} className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${info.color}`}></div>
                  <h3 className="font-semibold">{info.label}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-1">
                  {info.description}
                </p>
                <p className="text-sm font-mono">{info.range} points</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses ({courses.length})</CardTitle>
          <CardDescription>
            Configure points for each course.{" "}
            {courses.filter((c) => c.pointsConfiguration).length} courses
            configured
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Chapters</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Total Points</TableHead>
                <TableHead>Points/Chapter</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {courses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {course.thumbnail && (
                        <Image
                          src={course.thumbnail}
                          alt={course.title}
                          width={40}
                          height={40}
                          className="rounded object-cover"
                        />
                      )}
                      <div>
                        <div className="font-medium">{course.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {course.isPublished ? "✅ Published" : "⏸️ Draft"}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{course.chapterCount}</TableCell>
                  <TableCell>
                    {editingCourse === course.id ? (
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) =>
                          setFormData({ ...formData, difficulty: value })
                        }
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(DIFFICULTY_INFO).map(
                            ([key, info]) => (
                              <SelectItem key={key} value={key}>
                                {info.label}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>
                    ) : course.pointsConfiguration ? (
                      <Badge variant="secondary">
                        {
                          DIFFICULTY_INFO[
                            course.pointsConfiguration
                              .difficulty as keyof typeof DIFFICULTY_INFO
                          ]?.label
                        }
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {editingCourse === course.id ? (
                      <Input
                        type="number"
                        min="100"
                        max="50000"
                        value={formData.totalPoints}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            totalPoints: e.target.value,
                          })
                        }
                        className="w-[120px]"
                        placeholder="e.g., 5000"
                      />
                    ) : course.pointsConfiguration ? (
                      <span className="font-mono">
                        {course.pointsConfiguration.totalPoints.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not set</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {course.pointsConfiguration ? (
                      <span className="font-mono text-sm">
                        {course.pointsConfiguration.pointsPerChapter.toFixed(1)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {course.pointsConfiguration ? (
                      <Badge variant="default">Configured</Badge>
                    ) : (
                      <Badge variant="outline">Not configured</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {editingCourse === course.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSave(course.id)}
                            disabled={!formData.totalPoints}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingCourse(null)}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(course)}
                          >
                            {course.pointsConfiguration ? "Edit" : "Configure"}
                          </Button>
                          {course.pointsConfiguration && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(course.id)}
                            >
                              Remove
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

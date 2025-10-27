"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import {
  BookOpen,
  Trophy,
  TrendingUp,
  Award,
  Clock,
  Target,
  Sparkles,
  Edit,
  Calendar,
  GraduationCap,
  MapPin,
  Phone,
  Globe,
  Mail,
} from "lucide-react";
import {
  SiGithub,
  SiInstagram,
  SiYoutube,
  SiX,
} from "@icons-pack/react-simple-icons";

interface Course {
  id: string;
  title: string;
  progress: number;
  lastAccessed: string;
}

interface Profile {
  name: string;
  email: string;
  image: string;
  role: string;
  courses: Course[];
  totalScore: number;
  completedCourses: number;
  bio?: string;
  title?: string;
  location?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  twitter?: string;
  website?: string;
  youtube?: string;
  instagram?: string;
  avatar?: string;
  bannerImage?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const { status } = useSession();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/profile");
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        const data = await response.json();
        setProfile(data);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-background via-background to-muted/20">
        <div className="text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="absolute inset-0 rounded-full border-4 border-primary/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-primary animate-spin"></div>
          </div>
          <h2 className="text-2xl font-semibold animate-pulse">
            Loading your profile...
          </h2>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Profile Not Found</CardTitle>
            <CardDescription>
              We couldn&apos;t find your profile information.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const enrolledCoursesCount = profile.courses.length;
  const inProgressCourses = profile.courses.filter(
    (c) => c.progress > 0 && c.progress < 100
  ).length;
  const averageProgress =
    enrolledCoursesCount > 0
      ? profile.courses.reduce((sum, c) => sum + c.progress, 0) /
        enrolledCoursesCount
      : 0;

  const getRoleBadgeColor = (role: string) => {
    switch (role.toUpperCase()) {
      case "OWNER":
        return "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20";
      case "ADMIN":
        return "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20";
      case "INSTRUCTOR":
        return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20";
      case "STUDENT":
        return "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-700 dark:text-gray-300 border-gray-500/20";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background to-muted/20">
      {/* Banner Image */}
      {profile.bannerImage && (
        <div className="relative h-64 md:h-80 overflow-hidden z-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${profile.bannerImage})` }}
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-background/20 to-background" />
        </div>
      )}

      {/* Hero Section with Profile Header */}
      <div
        className={`relative overflow-visible${
          profile.bannerImage
            ? ""
            : " bg-linear-to-r from-primary/5 via-primary/10 to-primary/5"
        }`}
      >
        {!profile.bannerImage && (
          <>
            <div className="absolute inset-0 bg-grid-white/5 mask-[linear-gradient(0deg,white,rgba(255,255,255,0.5))]"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse delay-700"></div>
          </>
        )}

        <div
          className={`container relative z-10 ${
            profile.bannerImage ? "-mt-20 md:-mt-24" : "py-12 md:py-16"
          }`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-start gap-8">
              {/* Avatar with Animation */}
              <div className="relative group z-20">
                <div className="absolute -inset-1 bg-linear-to-r from-primary via-accent to-primary rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 animate-pulse"></div>
                <Avatar className="relative w-32 h-32 md:w-40 md:h-40 border-4 border-background shadow-2xl transition-transform duration-300 group-hover:scale-105 z-20">
                  <AvatarImage
                    src={profile.avatar || profile.image}
                    alt={profile.name}
                  />
                  <AvatarFallback className="text-4xl font-bold bg-linear-to-br from-primary to-accent text-primary-foreground">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-4xl md:text-5xl font-bold shimmer bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
                      {profile.name}
                    </h1>
                    <Badge
                      className={`${getRoleBadgeColor(
                        profile.role
                      )} border animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100`}
                    >
                      <Sparkles className="w-3 h-3 mr-1" />
                      {profile.role.charAt(0) +
                        profile.role.slice(1).toLowerCase()}
                    </Badge>
                  </div>

                  {profile.title && (
                    <p className="text-xl font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                      {profile.title}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-4 text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{profile.email}</span>
                    </div>
                    {profile.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{profile.location}</span>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        <span className="text-sm">{profile.phone}</span>
                      </div>
                    )}
                  </div>

                  {profile.bio && (
                    <Card className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-250">
                      <CardContent className="pt-6">
                        <p className="text-muted-foreground leading-relaxed">
                          {profile.bio}
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* Social Links */}
                  {(profile.linkedin ||
                    profile.github ||
                    profile.twitter ||
                    profile.website ||
                    profile.youtube ||
                    profile.instagram) && (
                    <div className="flex flex-wrap items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                      {profile.github && (
                        <Button variant="outline" size="icon" asChild>
                          <a
                            href={profile.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="GitHub"
                          >
                            <SiGithub className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {profile.instagram && (
                        <Button variant="outline" size="icon" asChild>
                          <a
                            href={profile.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Instagram"
                          >
                            <SiInstagram className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {profile.youtube && (
                        <Button variant="outline" size="icon" asChild>
                          <a
                            href={profile.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="YouTube"
                          >
                            <SiYoutube className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {profile.twitter && (
                        <Button variant="outline" size="icon" asChild>
                          <a
                            href={profile.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Twitter/X"
                          >
                            <SiX className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {profile.linkedin && (
                        <Button variant="outline" size="icon" asChild>
                          <a
                            href={profile.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="LinkedIn"
                          >
                            {/* No SiLinkedin in this icon pack; fallback to Globe icon */}
                            <Globe className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                      {profile.website && (
                        <Button variant="outline" size="icon" asChild>
                          <a
                            href={profile.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Website"
                          >
                            <Globe className="w-4 h-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-350">
                  <Button
                    onClick={() => router.push("/profile/edit")}
                    className="group"
                  >
                    <Edit className="w-4 h-4 mr-2 transition-transform group-hover:rotate-12" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/courses")}
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Courses
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button for mobile */}
      <div className="fixed bottom-6 right-6 z-40 md:hidden">
        <button
          onClick={() => router.push("/profile/edit")}
          className="bg-blue-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Edit Profile"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 10-4-4l-8 8v3z"
            />
          </svg>
        </button>
      </div>

      <div className="container py-8 md:py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {/* Total Courses */}
            <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 border-2 hover:border-primary/50 animate-in fade-in slide-in-from-bottom-4 duration-700 dashboard-stat-card dashboard-stat-card-animate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    Enrolled Courses
                  </CardDescription>
                  <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{enrolledCoursesCount}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  {inProgressCourses} in progress
                </p>
              </CardContent>
            </Card>

            {/* Completed Courses */}
            <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 border-2 hover:border-primary/50 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 dashboard-stat-card dashboard-stat-card-animate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Completed
                  </CardDescription>
                  <div className="p-2 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform">
                    <Award className="w-5 h-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {profile.completedCourses}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {enrolledCoursesCount > 0
                    ? `${Math.round(
                        (profile.completedCourses / enrolledCoursesCount) * 100
                      )}% completion rate`
                    : "No courses yet"}
                </p>
              </CardContent>
            </Card>

            {/* Average Progress */}
            <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 border-2 hover:border-primary/50 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200 dashboard-stat-card dashboard-stat-card-animate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Avg Progress
                  </CardDescription>
                  <div className="p-2 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">
                  {Math.round(averageProgress)}%
                </div>
                <Progress value={averageProgress} className="mt-2 h-2" />
              </CardContent>
            </Card>

            {/* Total Score */}
            <Card className="group hover:shadow-lg transition-all hover:-translate-y-1 border-2 hover:border-primary/50 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 dashboard-stat-card dashboard-stat-card-animate">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardDescription className="flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    Total Score
                  </CardDescription>
                  <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 group-hover:scale-110 transition-transform">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{profile.totalScore}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Points earned
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Tabs */}
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <Tabs defaultValue="courses" className="w-full">
              <CardHeader>
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="courses" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    My Courses
                  </TabsTrigger>
                  <TabsTrigger value="activity" className="gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Activity
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent>
                {/* Courses Tab */}
                <TabsContent value="courses" className="space-y-4 mt-0">
                  {profile.courses.length === 0 ? (
                    <div className="text-center py-12 space-y-4">
                      <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <BookOpen className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          No courses yet
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Start your learning journey by enrolling in a course
                        </p>
                        <Button onClick={() => router.push("/courses")}>
                          Browse Courses
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {profile.courses.map((course, index) => (
                        <Card
                          key={course.id}
                          className="group hover:shadow-md transition-all duration-300 cursor-pointer border-2 hover:border-primary/50 animate-in fade-in slide-in-from-right-4"
                          style={{ animationDelay: `${index * 100}ms` }}
                          onClick={() =>
                            router.push(`/courses/${course.id}/learn`)
                          }
                        >
                          <CardContent className="p-6">
                            <div className="space-y-4">
                              {/* Course Header */}
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                                    {course.title}
                                  </h3>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                    <div className="flex items-center gap-1">
                                      <Calendar className="w-4 h-4" />
                                      {new Date(
                                        course.lastAccessed
                                      ).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                      })}
                                    </div>
                                  </div>
                                </div>

                                {/* Progress Badge */}
                                <div className="text-center">
                                  {(() => {
                                    let colorClass = "text-muted-foreground";
                                    if (course.progress === 100)
                                      colorClass =
                                        "text-green-600 dark:text-green-400";
                                    else if (course.progress > 0)
                                      colorClass =
                                        "text-blue-600 dark:text-blue-400";
                                    const progressLabel =
                                      course.progress === 100
                                        ? "Complete"
                                        : "Progress";
                                    return (
                                      <>
                                        <div
                                          className={`text-2xl font-bold ${colorClass}`}
                                        >
                                          {course.progress}%
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                          {progressLabel}
                                        </p>
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="space-y-2">
                                <Progress
                                  value={course.progress}
                                  className="h-3 transition-all duration-500"
                                />
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  {(() => {
                                    let progressText = "Not started";
                                    if (course.progress === 100)
                                      progressText = "🎉 Completed!";
                                    else if (course.progress > 0)
                                      progressText = "Keep going!";
                                    return (
                                      <>
                                        <span>{progressText}</span>
                                        {course.progress > 0 &&
                                          course.progress < 100 && (
                                            <span className="flex items-center gap-1">
                                              <TrendingUp className="w-3 h-3" />
                                              {100 - course.progress}% remaining
                                            </span>
                                          )}
                                      </>
                                    );
                                  })()}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
                {/* Recent Courses List (outside main .map) */}
                {profile.courses.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-lg font-semibold mb-4">
                      Recent Courses
                    </h3>
                    {profile.courses
                      .toSorted(
                        (a, b) =>
                          new Date(b.lastAccessed).getTime() -
                          new Date(a.lastAccessed).getTime()
                      )
                      .slice(0, 5)
                      .map((course, index) => (
                        <button
                          key={course.id}
                          type="button"
                          className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer animate-in fade-in slide-in-from-left-4 w-full text-left focus:outline-none focus:ring-2 focus:ring-primary"
                          style={{ animationDelay: `${index * 50}ms` }}
                          aria-label={`Go to course ${course.title}`}
                          onClick={() =>
                            router.push(`/courses/${course.id}/learn`)
                          }
                        >
                          <div className="p-3 rounded-lg bg-primary/10">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium line-clamp-1">
                              {course.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(course.lastAccessed).toLocaleDateString(
                                "en-US",
                                {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                }
                              )}
                            </p>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {course.progress}%
                          </Badge>
                        </button>
                      ))}
                  </div>
                )}
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
}

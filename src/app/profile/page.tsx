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

interface RankInfo {
  name: string;
  icon: string;
  color: string;
  description?: string;
  tier?: string;
  minPoints: number;
  maxPoints?: number | null;
}

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  pointsReward: number;
}

interface Profile {
  name: string;
  email: string;
  image: string;
  role: string;
  courses: Course[];
  totalScore: number;
  completedCourses: number;
  rank?: {
    totalPoints: number;
    weeklyPoints: number;
    currentRank: RankInfo | null;
    nextRank: RankInfo | null;
    progressToNextRank: number;
    streakDays: number;
    highestRank: number;
    promotionCount: number;
    demotionCount: number;
    totalCompletions: number;
    rankHistory: Array<{
      id: string;
      oldRank: number;
      newRank: number;
      reason: string;
      createdAt: Date;
    }>;
  } | null;
  achievements?: {
    unlocked: Achievement[];
    total: number;
  };
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
          className={`container relative z-10 px-4 ${
            profile.bannerImage
              ? "-mt-16 sm:-mt-20 md:-mt-24"
              : "py-8 sm:py-12 md:py-16"
          }`}
        >
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 md:gap-8">
              {/* Avatar with Animation */}
              <div className="relative group z-20">
                <div className="absolute -inset-1 bg-linear-to-r from-primary via-accent to-primary rounded-full blur opacity-25 group-hover:opacity-40 transition duration-1000 animate-pulse"></div>
                <Avatar className="relative w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 border-4 border-background shadow-2xl transition-transform duration-300 group-hover:scale-105 z-20">
                  <AvatarImage
                    src={profile.avatar || profile.image}
                    alt={profile.name}
                  />
                  <AvatarFallback className="text-2xl sm:text-3xl md:text-4xl font-bold bg-linear-to-br from-primary to-accent text-primary-foreground">
                    {getInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-3 sm:space-y-4 text-center sm:text-left">
                <div className="space-y-2">
                  <div className="flex flex-col sm:flex-row items-center sm:items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold shimmer bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                    <p className="text-lg sm:text-xl font-medium text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                      {profile.title}
                    </p>
                  )}

                  <div className="flex flex-col sm:flex-row sm:flex-wrap items-center sm:items-center gap-2 sm:gap-4 text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                    <div className="flex items-center gap-2 text-xs sm:text-sm">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="truncate max-w-[200px] sm:max-w-none">
                        {profile.email}
                      </span>
                    </div>
                    {profile.location && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm">
                        <Phone className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{profile.phone}</span>
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

                <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-350 justify-center sm:justify-start">
                  <Button
                    onClick={() => router.push("/profile/edit")}
                    className="group w-full sm:w-auto"
                  >
                    <Edit className="w-4 h-4 mr-2 transition-transform group-hover:rotate-12" />
                    Edit Profile
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => router.push("/courses")}
                    className="w-full sm:w-auto"
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

      <div className="container py-6 sm:py-8 md:py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
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
                <TabsList className="grid w-full max-w-2xl grid-cols-3">
                  <TabsTrigger value="courses" className="gap-2">
                    <BookOpen className="w-4 h-4" />
                    My Courses
                  </TabsTrigger>
                  <TabsTrigger value="rank" className="gap-2">
                    <Trophy className="w-4 h-4" />
                    Rank & Progress
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

                {/* Rank & Progress Tab */}
                <TabsContent value="rank" className="space-y-6 mt-0">
                  {profile.rank ? (
                    <>
                      {/* Current Rank Card */}
                      <Card
                        className="border-2"
                        style={{
                          borderColor: profile.rank.currentRank?.color + "40",
                        }}
                      >
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-5xl">
                                {profile.rank.currentRank?.icon}
                              </div>
                              <div>
                                <CardTitle
                                  className="text-2xl"
                                  style={{
                                    color: profile.rank.currentRank?.color,
                                  }}
                                >
                                  {profile.rank.currentRank?.name}
                                </CardTitle>
                                <CardDescription>
                                  {profile.rank.currentRank?.description}
                                </CardDescription>
                              </div>
                            </div>
                            <Badge
                              variant="outline"
                              className="text-lg px-4 py-2"
                            >
                              {profile.rank.totalPoints.toLocaleString()} pts
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Progress to Next Rank */}
                          {profile.rank.nextRank && (
                            <div className="space-y-3">
                              <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">
                                  Progress to {profile.rank.nextRank.name}
                                </span>
                                <span className="text-muted-foreground">
                                  {profile.rank.progressToNextRank}%
                                </span>
                              </div>
                              <Progress
                                value={profile.rank.progressToNextRank}
                                className="h-3"
                              />
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                  {profile.rank.totalPoints.toLocaleString()}{" "}
                                  pts
                                </span>
                                <span className="flex items-center gap-1">
                                  <Target className="w-3 h-3" />
                                  {profile.rank.nextRank.minPoints.toLocaleString()}{" "}
                                  pts needed
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                              <div className="text-2xl font-bold text-orange-600">
                                {profile.rank.streakDays}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Day Streak
                              </div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                              <div className="text-2xl font-bold text-blue-600">
                                {profile.rank.weeklyPoints}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Weekly Points
                              </div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                              <div className="text-2xl font-bold text-green-600">
                                {profile.rank.totalCompletions}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Completions
                              </div>
                            </div>
                            <div className="text-center p-3 rounded-lg bg-muted/50">
                              <div className="text-2xl font-bold text-purple-600">
                                {profile.rank.promotionCount}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Promotions
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Achievements Section */}
                      {profile.achievements && (
                        <Card>
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <CardTitle className="flex items-center gap-2">
                                <Award className="w-5 h-5" />
                                Achievements
                              </CardTitle>
                              <Badge variant="outline">
                                {profile.achievements.unlocked.length} /{" "}
                                {profile.achievements.total}
                              </Badge>
                            </div>
                            <CardDescription>
                              Unlock achievements by completing challenges and
                              reaching milestones
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            {profile.achievements.unlocked.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {profile.achievements.unlocked.map(
                                  (achievement) => (
                                    <Card
                                      key={achievement.id}
                                      className="border-2"
                                    >
                                      <CardContent className="pt-4">
                                        <div className="flex items-start gap-3">
                                          <div className="text-3xl">
                                            {achievement.icon}
                                          </div>
                                          <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                              <h4 className="font-semibold">
                                                {achievement.name}
                                              </h4>
                                              <Badge
                                                variant={
                                                  achievement.rarity ===
                                                  "LEGENDARY"
                                                    ? "default"
                                                    : "outline"
                                                }
                                                className="text-xs"
                                              >
                                                {achievement.rarity}
                                              </Badge>
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">
                                              {achievement.description}
                                            </p>
                                            <div className="flex items-center gap-2 mt-2">
                                              <Sparkles className="w-3 h-3 text-yellow-600" />
                                              <span className="text-xs font-medium text-yellow-600">
                                                +{achievement.pointsReward}{" "}
                                                points
                                              </span>
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  )
                                )}
                              </div>
                            ) : (
                              <div className="text-center py-8 space-y-3">
                                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
                                  <Award className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground">
                                  No achievements unlocked yet. Start completing
                                  chapters to earn your first achievement!
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}

                      {/* Rank History */}
                      {profile.rank.rankHistory.length > 0 && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <TrendingUp className="w-5 h-5" />
                              Rank History
                            </CardTitle>
                            <CardDescription>
                              Your recent rank changes
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {profile.rank.rankHistory.map((history) => (
                                <div
                                  key={history.id}
                                  className="flex items-center gap-4 p-3 rounded-lg border"
                                >
                                  <div
                                    className={`p-2 rounded-full ${
                                      history.newRank > history.oldRank
                                        ? "bg-green-100 dark:bg-green-900/20"
                                        : history.newRank < history.oldRank
                                        ? "bg-red-100 dark:bg-red-900/20"
                                        : "bg-blue-100 dark:bg-blue-900/20"
                                    }`}
                                  >
                                    {history.newRank > history.oldRank ? (
                                      <TrendingUp className="w-4 h-4 text-green-600" />
                                    ) : history.newRank < history.oldRank ? (
                                      <TrendingUp className="w-4 h-4 text-red-600 rotate-180" />
                                    ) : (
                                      <Target className="w-4 h-4 text-blue-600" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="font-medium">
                                      Rank {history.oldRank} → Rank{" "}
                                      {history.newRank}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {history.reason}
                                    </div>
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(
                                      history.createdAt
                                    ).toLocaleDateString()}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  ) : (
                    <Card>
                      <CardContent className="text-center py-12 space-y-4">
                        <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                          <Trophy className="w-10 h-10 text-muted-foreground" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold mb-2">
                            Start Your Ranking Journey
                          </h3>
                          <p className="text-muted-foreground max-w-md mx-auto">
                            Complete chapters to earn points and climb the
                            ranks. Your ranking adventure begins with your first
                            chapter!
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* Recent Activity Tab */}
                <TabsContent value="activity" className="space-y-4 mt-0">
                  <Card>
                    <CardContent className="text-center py-12 space-y-4">
                      <div className="w-20 h-20 mx-auto rounded-full bg-muted flex items-center justify-center">
                        <Clock className="w-10 h-10 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          Activity Feed Coming Soon
                        </h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Your recent learning activity and milestones will
                          appear here.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
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

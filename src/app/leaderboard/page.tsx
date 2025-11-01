"use client";

import { useEffect, useState, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Crown,
  Loader2,
  Filter,
  ChevronDown,
  Sparkles,
  Target,
  Zap,
  Star,
  Users,
  Calendar,
  BarChart3,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface LeaderboardEntry {
  id: string;
  name: string;
  displayAvatar: string;
  title: string | null;
  totalScore: number;
  attemptCount: number;
  rank: number;
}

interface LeaderboardData {
  leaderboard: LeaderboardEntry[];
  currentUser: LeaderboardEntry | null;
  total: number;
}

export default function LeaderboardPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [showFilters, setShowFilters] = useState(false);
  const [scoreFilter, setScoreFilter] = useState("all"); // all, high (>80), medium (50-80), low (<50)
  const [sortBy, setSortBy] = useState("rank"); // rank, score, attempts

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          period,
          ...(search && { search }),
        });
        const response = await fetch(`/api/leaderboard?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch leaderboard");
        }
        const leaderboardData = await response.json();
        setData(leaderboardData);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load leaderboard. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, [search, period, toast]);

  // Filter and sort leaderboard data
  const filteredLeaderboard = useMemo(() => {
    if (!data?.leaderboard) return [];

    let filtered = [...data.leaderboard];

    // Score filter
    if (scoreFilter !== "all") {
      filtered = filtered.filter((entry) => {
        if (scoreFilter === "high") return entry.totalScore > 80;
        if (scoreFilter === "medium")
          return entry.totalScore >= 50 && entry.totalScore <= 80;
        if (scoreFilter === "low") return entry.totalScore < 50;
        return true;
      });
    }

    // Sort
    if (sortBy === "score") {
      filtered.sort((a, b) => b.totalScore - a.totalScore);
    } else if (sortBy === "attempts") {
      filtered.sort((a, b) => b.attemptCount - a.attemptCount);
    }
    // Default is already sorted by rank

    return filtered;
  }, [data?.leaderboard, scoreFilter, sortBy]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-orange-600" />;
    return null;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1)
      return "bg-linear-to-r from-yellow-400 to-yellow-600 text-white";
    if (rank === 2)
      return "bg-linear-to-r from-gray-300 to-gray-500 text-white";
    if (rank === 3)
      return "bg-linear-to-r from-orange-400 to-orange-600 text-white";
    if (rank <= 10)
      return "bg-linear-to-r from-blue-400 to-blue-600 text-white";
    return "bg-muted text-muted-foreground";
  };

  const getScoreBadgeColor = (score: number) => {
    if (score >= 90)
      return "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/20";
    if (score >= 70)
      return "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20";
    if (score >= 50)
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-300 border-yellow-500/20";
    return "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/20";
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const stats = useMemo(() => {
    if (!data?.leaderboard)
      return { avgScore: 0, totalAttempts: 0, topScore: 0 };

    const totalScore = data.leaderboard.reduce(
      (sum, entry) => sum + entry.totalScore,
      0
    );
    const totalAttempts = data.leaderboard.reduce(
      (sum, entry) => sum + entry.attemptCount,
      0
    );
    const topScore = data.leaderboard[0]?.totalScore || 0;

    return {
      avgScore: Math.round(totalScore / (data.leaderboard.length || 1)),
      totalAttempts,
      topScore,
    };
  }, [data?.leaderboard]);

  if (isLoading && !data) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-background via-background/50 to-muted/20 pt-20 pb-12">
      <div className="container mx-auto py-8 max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative inline-block mb-4">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
            <Trophy className="w-20 h-20 mx-auto text-primary relative animate-bounce" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-linear-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent mb-3">
            Leaderboard
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Compete with top performers and climb your way to the top! 🚀
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Participants
                  </p>
                  <p className="text-3xl font-bold">{data?.total || 0}</p>
                </div>
                <Users className="w-12 h-12 text-primary/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Top Score</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {stats.topScore}
                  </p>
                </div>
                <Star className="w-12 h-12 text-yellow-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Score</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.avgScore}
                  </p>
                </div>
                <BarChart3 className="w-12 h-12 text-blue-500/20" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/50 transition-colors">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Total Attempts
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.totalAttempts}
                  </p>
                </div>
                <Target className="w-12 h-12 text-purple-500/20" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Card className="mb-6 border-2">
            <CardContent className="pt-6">
              {/* Search and Period Filter Row */}
              <div className="grid gap-4 md:grid-cols-2 mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <Select value={period} onValueChange={setPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Time Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">🌐 All Time</SelectItem>
                      <SelectItem value="month">📅 This Month</SelectItem>
                      <SelectItem value="week">📆 This Week</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Advanced Filters Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full md:w-auto flex items-center gap-2 mb-3"
              >
                <Filter className="w-4 h-4" />
                Advanced Filters
                <ChevronDown
                  className={`w-4 h-4 transition-transform ${
                    showFilters ? "rotate-180" : ""
                  }`}
                />
              </Button>

              {/* Advanced Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
                      {/* Score Filter */}
                      <div>
                        <label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <Zap className="w-4 h-4 text-primary" />
                          Score Range
                        </label>
                        <Select
                          value={scoreFilter}
                          onValueChange={setScoreFilter}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Scores</SelectItem>
                            <SelectItem value="high">🔥 High (80+)</SelectItem>
                            <SelectItem value="medium">
                              ⚡ Medium (50-80)
                            </SelectItem>
                            <SelectItem value="low">
                              💪 Growing (&lt;50)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Sort By */}
                      <div>
                        <label className="text-sm font-medium mb-2 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          Sort By
                        </label>
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="rank">🏆 Rank</SelectItem>
                            <SelectItem value="score">⭐ Score</SelectItem>
                            <SelectItem value="attempts">
                              🎯 Attempts
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* View Mode */}
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          View Mode
                        </label>
                        <div className="flex gap-2">
                          <Button
                            variant={
                              viewMode === "list" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setViewMode("list")}
                            className="flex-1"
                          >
                            📋 List
                          </Button>
                          <Button
                            variant={
                              viewMode === "grid" ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setViewMode("grid")}
                            className="flex-1"
                          >
                            🎴 Grid
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top 3 Podium */}
        {filteredLeaderboard.length >= 3 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              Top Champions
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="md:mt-8"
              >
                <Card className="relative overflow-hidden border-2 border-gray-400/50 hover:border-gray-400 transition-all hover:shadow-xl">
                  <div className="absolute inset-0 bg-linear-to-br from-gray-200/20 to-gray-400/20"></div>
                  <CardContent className="pt-6 text-center relative z-10">
                    <div className="mb-4 relative inline-block">
                      <div className="absolute inset-0 bg-gray-400/20 blur-xl rounded-full"></div>
                      <Medal className="w-16 h-16 text-gray-500 relative animate-pulse" />
                    </div>
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-gray-400 shadow-lg ring-4 ring-gray-200/50">
                      <AvatarImage src={filteredLeaderboard[1].displayAvatar} />
                      <AvatarFallback className="text-2xl">
                        {getInitials(filteredLeaderboard[1].name)}
                      </AvatarFallback>
                    </Avatar>
                    <Badge className={getRankBadgeColor(2)} variant="secondary">
                      #2
                    </Badge>
                    <h3 className="font-bold text-xl mt-2 mb-1">
                      {filteredLeaderboard[1].name}
                    </h3>
                    {filteredLeaderboard[1].title && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {filteredLeaderboard[1].title}
                      </p>
                    )}
                    <div className="text-4xl font-bold text-gray-600 mb-2">
                      {filteredLeaderboard[1].totalScore}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {filteredLeaderboard[1].attemptCount} attempts
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className="relative overflow-hidden border-4 border-yellow-500/50 hover:border-yellow-500 transition-all hover:shadow-2xl shadow-yellow-500/20">
                  <div className="absolute inset-0 bg-linear-to-br from-yellow-200/30 to-yellow-500/30 animate-pulse"></div>
                  <CardContent className="pt-8 text-center relative z-10">
                    <div className="mb-4 relative inline-block">
                      <div className="absolute inset-0 bg-yellow-400/40 blur-2xl rounded-full animate-pulse"></div>
                      <Crown className="w-20 h-20 text-yellow-500 relative animate-bounce" />
                    </div>
                    <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-yellow-500 shadow-2xl ring-4 ring-yellow-200/50">
                      <AvatarImage src={filteredLeaderboard[0].displayAvatar} />
                      <AvatarFallback className="text-3xl">
                        {getInitials(filteredLeaderboard[0].name)}
                      </AvatarFallback>
                    </Avatar>
                    <Badge className={getRankBadgeColor(1)} variant="secondary">
                      👑 #1 Champion
                    </Badge>
                    <h3 className="font-bold text-2xl mt-3 mb-1">
                      {filteredLeaderboard[0].name}
                    </h3>
                    {filteredLeaderboard[0].title && (
                      <p className="text-sm text-muted-foreground mb-4">
                        {filteredLeaderboard[0].title}
                      </p>
                    )}
                    <div className="text-5xl font-bold bg-linear-to-r from-yellow-600 to-yellow-400 bg-clip-text text-transparent mb-3">
                      {filteredLeaderboard[0].totalScore}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {filteredLeaderboard[0].attemptCount} attempts
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="md:mt-8"
              >
                <Card className="relative overflow-hidden border-2 border-orange-400/50 hover:border-orange-500 transition-all hover:shadow-xl">
                  <div className="absolute inset-0 bg-linear-to-br from-orange-200/20 to-orange-500/20"></div>
                  <CardContent className="pt-6 text-center relative z-10">
                    <div className="mb-4 relative inline-block">
                      <div className="absolute inset-0 bg-orange-400/20 blur-xl rounded-full"></div>
                      <Award className="w-16 h-16 text-orange-600 relative animate-pulse" />
                    </div>
                    <Avatar className="w-24 h-24 mx-auto mb-4 border-4 border-orange-500 shadow-lg ring-4 ring-orange-200/50">
                      <AvatarImage src={filteredLeaderboard[2].displayAvatar} />
                      <AvatarFallback className="text-2xl">
                        {getInitials(filteredLeaderboard[2].name)}
                      </AvatarFallback>
                    </Avatar>
                    <Badge className={getRankBadgeColor(3)} variant="secondary">
                      #3
                    </Badge>
                    <h3 className="font-bold text-xl mt-2 mb-1">
                      {filteredLeaderboard[2].name}
                    </h3>
                    {filteredLeaderboard[2].title && (
                      <p className="text-sm text-muted-foreground mb-3">
                        {filteredLeaderboard[2].title}
                      </p>
                    )}
                    <div className="text-4xl font-bold text-orange-600 mb-2">
                      {filteredLeaderboard[2].totalScore}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {filteredLeaderboard[2].attemptCount} attempts
                    </Badge>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Full Rankings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
        >
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                {viewMode === "list" ? "Full Rankings" : "All Participants"}
              </CardTitle>
              <CardDescription>
                {filteredLeaderboard.length > 0
                  ? `Showing ${filteredLeaderboard.length} of ${
                      data?.total || 0
                    } participants`
                  : "No participants found with current filters"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {viewMode === "list" ? (
                <div className="space-y-2">
                  {filteredLeaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`flex items-center gap-4 p-4 rounded-lg border-2 transition-all ${
                        entry.id === session?.user?.id
                          ? "bg-primary/10 border-primary/50 shadow-lg"
                          : "hover:bg-muted/50 hover:border-primary/30 border-transparent"
                      }`}
                    >
                      <div className="w-16 flex justify-center">
                        {entry.rank <= 3 ? (
                          <div className="relative">
                            {getRankIcon(entry.rank)}
                            <div className="absolute -inset-2 bg-current opacity-10 blur-lg rounded-full"></div>
                          </div>
                        ) : (
                          <Badge
                            className={getRankBadgeColor(entry.rank)}
                            variant="secondary"
                          >
                            #{entry.rank}
                          </Badge>
                        )}
                      </div>
                      <Avatar className="w-14 h-14 border-2">
                        <AvatarImage src={entry.displayAvatar} />
                        <AvatarFallback>
                          {getInitials(entry.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-lg truncate">
                            {entry.name}
                          </h4>
                          {entry.id === session?.user?.id && (
                            <Badge
                              variant="default"
                              className="text-xs animate-pulse"
                            >
                              You
                            </Badge>
                          )}
                          {entry.rank <= 10 &&
                            entry.id !== session?.user?.id && (
                              <Badge variant="secondary" className="text-xs">
                                Top 10
                              </Badge>
                            )}
                        </div>
                        {entry.title && (
                          <p className="text-sm text-muted-foreground truncate">
                            {entry.title}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge
                          className={getScoreBadgeColor(entry.totalScore)}
                          variant="outline"
                        >
                          <Star className="w-3 h-3 mr-1" />
                          {entry.totalScore} pts
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {entry.attemptCount}{" "}
                          {entry.attemptCount === 1 ? "attempt" : "attempts"}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {filteredLeaderboard.length === 0 && (
                    <div className="text-center py-16">
                      <TrendingUp className="w-20 h-20 mx-auto text-muted-foreground mb-4 opacity-50" />
                      <h3 className="text-2xl font-semibold mb-2">
                        No rankings found
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Try adjusting your filters or complete some quizzes to
                        appear here!
                      </p>
                      <Button
                        onClick={() => {
                          setScoreFilter("all");
                          setSearch("");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                // Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredLeaderboard.map((entry, index) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <Card
                        className={`hover:shadow-lg transition-all ${
                          entry.id === session?.user?.id
                            ? "border-2 border-primary"
                            : ""
                        }`}
                      >
                        <CardContent className="pt-6 text-center">
                          <div className="mb-3">
                            {entry.rank <= 3 ? (
                              getRankIcon(entry.rank)
                            ) : (
                              <Badge className={getRankBadgeColor(entry.rank)}>
                                #{entry.rank}
                              </Badge>
                            )}
                          </div>
                          <Avatar className="w-20 h-20 mx-auto mb-3 border-2">
                            <AvatarImage src={entry.displayAvatar} />
                            <AvatarFallback>
                              {getInitials(entry.name)}
                            </AvatarFallback>
                          </Avatar>
                          <h4 className="font-semibold mb-1 truncate">
                            {entry.name}
                          </h4>
                          {entry.title && (
                            <p className="text-xs text-muted-foreground mb-2 truncate">
                              {entry.title}
                            </p>
                          )}
                          <div className="text-2xl font-bold mb-2">
                            {entry.totalScore}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {entry.attemptCount} attempts
                          </Badge>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Current User Card (if not in visible list) */}
        {data?.currentUser &&
          !filteredLeaderboard.find((e) => e.id === session?.user?.id) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Card className="mt-6 border-2 border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Your Ranking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 p-4 bg-background rounded-lg">
                    <Badge
                      className={getRankBadgeColor(data.currentUser.rank)}
                      variant="secondary"
                    >
                      #{data.currentUser.rank}
                    </Badge>
                    <Avatar className="w-14 h-14 border-2 border-primary">
                      <AvatarImage src={data.currentUser.displayAvatar} />
                      <AvatarFallback>
                        {getInitials(data.currentUser.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h4 className="font-semibold text-lg">
                        {data.currentUser.name}
                      </h4>
                      {data.currentUser.title && (
                        <p className="text-sm text-muted-foreground">
                          {data.currentUser.title}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <Badge
                        className={getScoreBadgeColor(
                          data.currentUser.totalScore
                        )}
                      >
                        {data.currentUser.totalScore} pts
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {data.currentUser.attemptCount} attempts
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
      </div>
    </div>
  );
}

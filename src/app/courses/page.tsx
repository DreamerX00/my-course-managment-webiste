"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { SearchBar } from "@/components/SearchBar";
import { FilterBar } from "@/components/FilterBar";
import { CourseGrid } from "@/components/CourseGrid";
import { ModernCourseCard } from "@/components/ModernCourseCard";

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  price: number;
  rating: number;
  enrolledCount: number;
  duration: string;
  chaptersCount: number;
  thumbnail: string;
  isFree: boolean;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ContentSettings {
  filterCategories?: Array<{ name: string; color: string }>;
  layoutOptions?: {
    showFiltersSidebar?: boolean;
    showSortingDropdown?: boolean;
    gridColumns?: number;
    showTrendingSection?: boolean;
    showRecentlyAdded?: boolean;
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Content settings state
  const [contentSettings, setContentSettings] =
    useState<ContentSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriceType, setSelectedPriceType] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");

  // Check if filtering by a specific category
  const isFilteringByCategory = selectedCategory !== "all";

  // Fetch content settings from API
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setSettingsLoading(true);
        const response = await fetch("/api/content-settings");
        if (!response.ok) throw new Error("Failed to fetch settings");
        const data = await response.json();
        setContentSettings(data);
      } catch (err) {
        setContentSettings(null);
        console.error("Error fetching content settings:", err);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  // Fetch courses from API
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/courses");
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setCourses(data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load courses");
        setLoading(false);
        console.error("Error fetching courses:", err);
      }
    };
    fetchCourses();
  }, []);

  // Filter and sort courses
  const filteredAndSortedCourses = useMemo(() => {
    const filtered = courses.filter((course) => {
      // Search filter
      const matchesSearch =
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter - check for exact match or "all"
      const matchesCategory =
        selectedCategory === "all" || course.category === selectedCategory;

      // Price filter
      const matchesPrice =
        selectedPriceType === "all" ||
        (selectedPriceType === "free" && course.isFree) ||
        (selectedPriceType === "paid" && !course.isFree);

      return matchesSearch && matchesCategory && matchesPrice;
    });

    // Sort courses
    switch (selectedSort) {
      case "newest":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "popular":
        filtered.sort((a, b) => b.enrolledCount - a.enrolledCount);
        break;
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "duration":
        filtered.sort((a, b) => {
          const aHours = parseInt(a.duration.split(" ")[0]);
          const bHours = parseInt(b.duration.split(" ")[0]);
          return aHours - bHours;
        });
        break;
      default:
        break;
    }

    return filtered;
  }, [courses, searchQuery, selectedCategory, selectedPriceType, selectedSort]);

  // Dynamic categories from settings
  const dynamicCategories =
    contentSettings?.filterCategories?.map((cat) => cat.name) || [];
  const showFiltersSidebar =
    contentSettings?.layoutOptions?.showFiltersSidebar !== false;
  const showSortingDropdown =
    contentSettings?.layoutOptions?.showSortingDropdown !== false;
  const gridColumns = contentSettings?.layoutOptions?.gridColumns || 3;
  const showTrendingSection =
    contentSettings?.layoutOptions?.showTrendingSection !== false;
  const showRecentlyAdded =
    contentSettings?.layoutOptions?.showRecentlyAdded !== false;

  // Get trending courses (most enrolled)
  const trendingCourses = useMemo(() => {
    return [...courses]
      .sort((a, b) => b.enrolledCount - a.enrolledCount)
      .slice(0, 6);
  }, [courses]);

  // Get recently added courses
  const recentlyAddedCourses = useMemo(() => {
    return [...courses]
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 6);
  }, [courses]);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section with Animated Gradient and Typewriter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 relative"
        >
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-6 bg-linear-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent"
          >
            Explore All Courses
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg leading-8 text-gray-600 max-w-3xl mx-auto"
          >
            Dive into a wide range of programming and tech courses designed to
            help you master new skills and advance your career.
          </motion.p>
        </motion.div>

        {/* Floating Filter Button for Mobile */}
        <div className="fixed bottom-6 right-6 z-40 md:hidden">
          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.08 }}
            onClick={() => {
              // Scroll to filter bar
              const filterBar = document.getElementById("mobile-filter-bar");
              if (filterBar)
                filterBar.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
            }}
            className="bg-blue-600 text-white rounded-full shadow-lg p-4 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Show Filters"
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
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707l-6.414 6.414A1 1 0 0013 13.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 017 17v-3.586a1 1 0 00-.293-.707L3.293 6.707A1 1 0 013 6V4z"
              />
            </svg>
          </motion.button>
        </div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 space-y-6"
          id="mobile-filter-bar"
        >
          <SearchBar onSearch={setSearchQuery} className="max-w-md mx-auto" />
          <FilterBar
            categories={dynamicCategories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedPriceType={selectedPriceType}
            onPriceTypeChange={setSelectedPriceType}
            selectedSort={selectedSort}
            onSortChange={setSelectedSort}
            showSidebar={showFiltersSidebar}
            showSorting={showSortingDropdown}
            loading={settingsLoading}
            colorMap={contentSettings?.filterCategories?.reduce(
              (acc: Record<string, string>, cat) => {
                acc[cat.name] = cat.color;
                return acc;
              },
              {}
            )}
          />
        </motion.div>

        {/* Trending Section - only show when not filtering by category */}
        {!isFilteringByCategory &&
          showTrendingSection &&
          trendingCourses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-12"
            >
              <motion.div
                initial={{ opacity: 0, x: -40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="mb-6 flex flex-col items-center"
              >
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 bg-linear-to-r from-pink-500 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient-move">
                  <span className="inline-block">🔥 Trending Courses</span>
                </h2>
                <p className="text-gray-600">
                  Most popular courses based on enrollment
                </p>
              </motion.div>
              <div
                className={`grid gap-6 ${
                  gridColumns === 2
                    ? "grid-cols-1 md:grid-cols-2"
                    : gridColumns === 4
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {trendingCourses
                  .slice(0, gridColumns * 2)
                  .map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                    >
                      <ModernCourseCard course={course} index={index} />
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}

        {/* Recently Added Section - only show when not filtering by category */}
        {!isFilteringByCategory &&
          showRecentlyAdded &&
          recentlyAddedCourses.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-12"
            >
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.7 }}
                className="mb-6 flex flex-col items-center"
              >
                <h2 className="text-2xl sm:text-3xl font-extrabold mb-2 bg-linear-to-r from-green-400 via-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient-move">
                  <span className="inline-block">🆕 Recently Added</span>
                </h2>
                <p className="text-gray-600">
                  Latest courses added to our platform
                </p>
              </motion.div>
              <div
                className={`grid gap-6 ${
                  gridColumns === 2
                    ? "grid-cols-1 md:grid-cols-2"
                    : gridColumns === 4
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {recentlyAddedCourses
                  .slice(0, gridColumns * 2)
                  .map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.6 }}
                    >
                      <ModernCourseCard course={course} index={index} />
                    </motion.div>
                  ))}
              </div>
            </motion.div>
          )}

        {/* Results Count */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6"
          >
            <p className="text-sm text-gray-600">
              Showing {filteredAndSortedCourses.length} of {courses.length}{" "}
              courses
            </p>
          </motion.div>
        )}

        {/* Course Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
        >
          <CourseGrid
            courses={filteredAndSortedCourses}
            loading={loading}
            error={error}
            gridColumns={gridColumns}
          />
        </motion.div>
      </div>
    </div>
  );
}

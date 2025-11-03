import { z } from "zod";

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const completeSignupSchema = z.object({
  token: z.string().min(1, "Token is required"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const validateInvitationSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

// ============================================================================
// USER MANAGEMENT SCHEMAS
// ============================================================================

export const inviteUserSchema = z.object({
  email: z.string().email("Invalid email address"),
  role: z.enum(["STUDENT", "INSTRUCTOR", "ADMIN", "OWNER"]),
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["STUDENT", "INSTRUCTOR", "ADMIN", "OWNER"]).optional(),
  password: z.string().min(8).optional(),
});

// ============================================================================
// PROFILE SCHEMAS
// ============================================================================

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  title: z.string().max(100).optional(),
  location: z.string().max(100).optional(),
  phone: z.string().max(20).optional(),
  website: z.string().url().optional().or(z.literal("")),
  github: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  youtube: z.string().optional(),
  instagram: z.string().optional(),
  avatar: z.string().url().optional().or(z.literal("")),
  bannerImage: z.string().url().optional().or(z.literal("")),
  isPublic: z.boolean().optional(),
});

// ============================================================================
// COURSE SCHEMAS
// ============================================================================

export const createCourseSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  price: z.number().min(0).optional(),
  isPublished: z.boolean().optional(),
});

export const updateCourseSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  category: z.string().optional(),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  price: z.number().min(0).optional(),
  isPublished: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
});

export const courseDetailsSchema = z.object({
  instructor: z
    .object({
      name: z.string(),
      avatar: z.string().url().optional(),
      rating: z.number().min(0).max(5).optional(),
      students: z.number().min(0).optional(),
    })
    .optional(),
  highlights: z.array(z.string()).optional(),
  requirements: z.array(z.string()).optional(),
  learningOutcomes: z.array(z.string()).optional(),
  targetAudience: z.array(z.string()).optional(),
  duration: z.string().optional(),
  language: z.string().optional(),
  certificateAvailable: z.boolean().optional(),
  lastUpdated: z.string().optional(),
});

// ============================================================================
// CHAPTER SCHEMAS
// ============================================================================

export const createChapterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  content: z.string().optional(),
  order: z.number().int().min(0).optional(),
});

export const updateChapterSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  isPublished: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export const reorderChaptersSchema = z.object({
  chapters: z.array(
    z.object({
      id: z.string(),
      order: z.number().int().min(0),
    })
  ),
});

// ============================================================================
// SUBCHAPTER SCHEMAS
// ============================================================================

export const createSubchapterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  order: z.number().int().min(0).optional(),
});

export const updateSubchapterSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().optional().or(z.literal("")),
  order: z.number().int().min(0).optional(),
});

// ============================================================================
// LESSON SCHEMAS
// ============================================================================

export const createLessonSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  duration: z.number().int().min(0).optional(),
  order: z.number().int().min(0).optional(),
});

export const updateLessonSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().optional(),
  videoUrl: z.string().url().optional(),
  duration: z.number().int().min(0).optional(),
  order: z.number().int().min(0).optional(),
  isCompleted: z.boolean().optional(),
});

// ============================================================================
// CONTENT SETTINGS SCHEMAS
// ============================================================================

export const contentSettingsSchema = z.object({
  filterCategories: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        color: z.string(),
        order: z.number().int(),
      })
    )
    .optional(),
  featuredCourses: z.array(z.string()).optional(),
  layoutOptions: z
    .object({
      gridColumns: z.number().int().min(1).max(4).optional(),
      showFiltersSidebar: z.boolean().optional(),
      showSortingDropdown: z.boolean().optional(),
      showTrendingSection: z.boolean().optional(),
      showRecentlyAdded: z.boolean().optional(),
    })
    .optional(),
});

// ============================================================================
// LEADERBOARD SCHEMAS
// ============================================================================

export const leaderboardQuerySchema = z.object({
  courseId: z.string().optional(),
  search: z.string().optional(),
  period: z.enum(["all", "week", "month"]).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// ============================================================================
// UPLOAD SCHEMAS
// ============================================================================

export const uploadFileSchema = z.object({
  file: z.instanceof(File),
  folder: z.enum(["avatar", "banner", "course", "lesson"]).optional(),
});

// ============================================================================
// QUERY PARAMS SCHEMAS
// ============================================================================

export const paginationSchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("10"),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type CompleteSignupInput = z.infer<typeof completeSignupSchema>;
export type ValidateInvitationInput = z.infer<typeof validateInvitationSchema>;
export type InviteUserInput = z.infer<typeof inviteUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;
export type CourseDetailsInput = z.infer<typeof courseDetailsSchema>;
export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type UpdateChapterInput = z.infer<typeof updateChapterSchema>;
export type ReorderChaptersInput = z.infer<typeof reorderChaptersSchema>;
export type CreateSubchapterInput = z.infer<typeof createSubchapterSchema>;
export type UpdateSubchapterInput = z.infer<typeof updateSubchapterSchema>;
export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;
export type ContentSettingsInput = z.infer<typeof contentSettingsSchema>;
export type LeaderboardQuery = z.infer<typeof leaderboardQuerySchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;

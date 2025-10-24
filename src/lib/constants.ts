import { LucideIcon } from "lucide-react"
import { 
  Lightbulb, 
  BookOpen, 
  Download, 
  Users, 
  Trophy, 
  ClipboardList, 
  CalendarDays,
  MessageSquare,
  Share2,
} from "lucide-react"
import { SiGithub, SiLinkedin, SiX, SiYoutube } from "react-icons/si";

// --- Hero Section --- 
export const HERO_CONTENT = {
  title: "Learn Programming The Fun Way 👨‍💻✨",
  subtitle: "From YouTube to Mastery — Track your Progress, Earn Points & Compete!",
  cta1: "Browse Courses",
  cta2: "Join Community",
}

// --- Features Preview Section ---
interface Feature {
  icon: LucideIcon; // Using LucideIcon type
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    icon: ClipboardList,
    title: "Progress Tracking",
    description: "Monitor your learning journey and visualize your achievements with detailed progress reports.",
  },
  {
    icon: Lightbulb,
    title: "Interactive Quizzes",
    description: "Test your knowledge with engaging quizzes, get instant feedback, and reinforce your learning.",
  },
  {
    icon: Download,
    title: "Downloadable Resources",
    description: "Access high-quality notes, code snippets, and supplementary materials for offline study.",
  },
  {
    icon: Trophy,
    title: "Leaderboards & Competitions",
    description: "Compete with other learners, earn points, and climb the ranks on our interactive leaderboards.",
  },
  {
    icon: Users,
    title: "Vibrant Community",
    description: "Connect with fellow students and instructors, discuss topics, and collaborate on projects.",
  },
  {
    icon: CalendarDays,
    title: "Real-time Events",
    description: "Join live sessions, Q&A's, and coding challenges to learn from experts and peers.",
  },
]

// --- Courses Snapshot Section ---
export interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  progress: number;
  tag: string;
  imageUrl: string;
}

export const FEATURED_COURSES: CourseCardProps[] = [
  {
    id: "course-1",
    title: "Web Dev Fundamentals",
    description: "Build your first websites with HTML, CSS, & JavaScript.",
    progress: 75,
    tag: "Beginner",
    imageUrl: "https://images.unsplash.com/photo-1547942971-e70a3c26b64f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "course-2",
    title: "Advanced React.js",
    description: "Master Hooks, Context & Performance Optimization.",
    progress: 50,
    tag: "Intermediate",
    imageUrl: "https://images.unsplash.com/photo-1633356122544-cd36087ad0a8?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
  {
    id: "course-3",
    title: "TypeScript Deep Dive",
    description: "Understand types, interfaces, generics & more.",
    progress: 25,
    tag: "Advanced",
    imageUrl: "https://images.unsplash.com/photo-1680373756858-bd45ec050c99?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  },
]

// --- Why Choose Us Section ---
interface WhyChooseUsItem {
  icon: LucideIcon;
  text: string;
}

export const WHY_CHOOSE_US: WhyChooseUsItem[] = [
  {
    icon: ClipboardList,
    text: "Track your learning progress and stay motivated.",
  },
  {
    icon: Download,
    text: "Download comprehensive notes and study resources.",
  },
  {
    icon: Trophy,
    text: "Battle in real-time competitions and climb the leaderboard.",
  },
  {
    icon: MessageSquare,
    text: "Engage with a supportive community and get your queries resolved.",
  },
  {
    icon: Share2,
    text: "Share your achievements and learn from others' journeys.",
  },
  {
    icon: BookOpen,
    text: "Access a wide range of courses on programming and tech.",
  },
]

// --- Newsletter Section ---
export const NEWSLETTER_CONTENT = {
  title: "Stay Updated with Dreamer Academy",
  subtitle: "Get weekly quizzes and study resources — right in your inbox!",
  placeholder: "Your email address",
  buttonText: "Subscribe",
}

// --- Footer Section ---
// Footer and social links
export const FOOTER_LINKS = {
  about: [
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy Policy", href: "/privacy" },
  ],
  resources: [
    { name: "Courses", href: "/courses" },
    { name: "Quizzes", href: "/quizzes" },
    { name: "Leaderboard", href: "/leaderboard" },
  ],
  socials: [
    { icon: SiYoutube, href: "https://www.youtube.com/@DreamerBhai" },
    { icon: SiGithub, href: "https://github.com/DreamerX00" },
    { icon: SiLinkedin, href: "https://linkedin.com/in/akashs08" },
    { icon: SiX, href: "https://www.twitter.com/@XDreamer0" },
  ],
}

export const COPYRIGHT_TEXT = "© 2025 Dreamer Academy. All rights reserved."

// --- All Courses Data (for Courses Page) ---
export interface CourseDetailCardProps {
  id: string;
  title: string;
  description: string;
  tags: string[];
  topicCount: number;
  resourcesAvailable: boolean;
  imageUrl: string;
}

export const ALL_COURSES: CourseDetailCardProps[] = [
  {
    id: 'dsa',
    title: 'DSA Cracker 🔥',
    description: 'Master Data Structures and Algorithms for interviews and competitive programming. This course provides comprehensive coverage with practical problems and solutions.',
    tags: ['DSA', 'Beginner', 'Interview Prep', 'Popular'],
    topicCount: 45,
    resourcesAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd953bb09f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'os',
    title: 'Operating Systems',
    description: 'Explore the core concepts of operating systems, including processes, threads, memory management, and file systems. Essential for computer science students.',
    tags: ['OS', 'Core CS', 'Conceptual'],
    topicCount: 30,
    resourcesAvailable: false,
    imageUrl: 'https://images.unsplash.com/photo-1549682520-cb2f111867c4?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'sql',
    title: 'SQL + DBMS',
    description: 'Learn foundational SQL queries, database design principles, and how to interact with relational database management systems.',
    tags: ['SQL', 'PostgreSQL', 'DBMS'],
    topicCount: 25,
    resourcesAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1589764516335-51341a9e7f7b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'java-basics',
    title: 'Java Programming Basics',
    description: 'An introductory course to Java programming, covering syntax, OOP concepts, and basic data structures. Perfect for beginners.',
    tags: ['Java', 'Beginner', 'OOP'],
    topicCount: 35,
    resourcesAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1587620962725-abab7fd29246?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'python-web',
    title: 'Python for Web Development',
    description: 'Learn to build web applications using Python frameworks like Django and Flask. Covers REST APIs and database integration.',
    tags: ['Python', 'Web Dev', 'Django', 'Flask'],
    topicCount: 40,
    resourcesAvailable: true,
    imageUrl: 'https://images.unsplash.com/photo-1563200923-42e742e47265?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  },
  {
    id: 'ml-intro',
    title: 'Introduction to Machine Learning',
    description: 'Get started with machine learning concepts, algorithms, and practical implementations using Python and popular libraries.',
    tags: ['ML', 'AI', 'Python', 'Beginner'],
    topicCount: 50,
    resourcesAvailable: false,
    imageUrl: 'https://images.unsplash.com/photo-1596551322137-975ce4521789?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
  }
]; 
-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "totalScore" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Course" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "instructorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Option" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "chapterId" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_providerAccountId_key" ON "accounts"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_sessionToken_key" ON "sessions"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Option" ADD CONSTRAINT "Option_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Progress" ADD CONSTRAINT "Progress_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizAttempt" ADD CONSTRAINT "QuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed Data

-- Insert Sample Users
INSERT INTO "users" ("id", "name", "email", "password", "role", "totalScore") VALUES
('user_1_id', 'John Doe', 'john.doe@example.com', '$2a$10$w3U6lK9w1q5J4p3p0d9eue0s.J9Q0z6f8d7b8c9d0e1f2a3b4c5d6e7f8a9b', 'STUDENT', 150),
('instructor_1_id', 'Jane Smith', 'jane.smith@example.com', '$2a$10$w3U6lK9w1q5J4p3p0d9eue0s.J9Q0z6f8d7b8c9d0e1f2a3b4c5d6e7f8a9b', 'INSTRUCTOR', 0),
('user_2_id', 'Alice Johnson', 'alice.j@example.com', '$2a$10$w3U6lK9w1q5J4p3p0d9eue0s.J9Q0z6f8d7b8c9d0e1f2a3b4c5d6e7f8a9b', 'STUDENT', 200);

-- Insert Sample Courses
INSERT INTO "Course" ("id", "title", "description", "price", "imageUrl", "instructorId", "featured", "createdAt", "updatedAt") VALUES
('course_1_id', 'Introduction to Web Development', 'Learn the basics of HTML, CSS, and JavaScript.', 29.99, 'https://images.unsplash.com/photo-1547942971-e70a3c26b64f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'instructor_1_id', true, NOW(), NOW()),
('course_2_id', 'Advanced React Patterns', 'Master advanced React concepts and design patterns.', 49.99, 'https://images.unsplash.com/photo-1633356122544-cd36087ad0a8?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'instructor_1_id', true, NOW(), NOW()),
('course_3_id', 'TypeScript Fundamentals', 'A comprehensive guide to TypeScript for modern web development.', 39.99, 'https://images.unsplash.com/photo-1680373756858-bd45ec050c99?q=80&w=2832&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', 'instructor_1_id', false, NOW(), NOW());

-- Insert Sample Chapters for Course 1
INSERT INTO "Chapter" ("id", "title", "content", "courseId", "createdAt", "updatedAt") VALUES
('chapter_1_1_id', 'HTML Basics', 'Content for HTML Basics.', 'course_1_id', NOW(), NOW()),
('chapter_1_2_id', 'CSS Styling', 'Content for CSS Styling.', 'course_1_id', NOW(), NOW()),
('chapter_1_3_id', 'JavaScript Fundamentals', 'Content for JavaScript Fundamentals.', 'course_1_id', NOW(), NOW());

-- Insert Sample Quizzes for Course 1
INSERT INTO "Quiz" ("id", "title", "description", "courseId", "createdAt", "updatedAt") VALUES
('quiz_1_id', 'Web Dev Basics Quiz', 'Test your knowledge on web development fundamentals.', 'course_1_id', NOW(), NOW());

-- Insert Sample Questions for Quiz 1
INSERT INTO "Question" ("id", "quizId", "text", "type", "createdAt", "updatedAt") VALUES
('question_1_1_id', 'quiz_1_id', 'What does HTML stand for?', 'multiple-choice', NOW(), NOW()),
('question_1_2_id', 'quiz_1_id', 'Which CSS property is used for changing the text color?', 'multiple-choice', NOW(), NOW());

-- Insert Sample Options for Question 1
INSERT INTO "Option" ("id", "questionId", "text", "isCorrect") VALUES
('option_1_1_1_id', 'question_1_1_id', 'Hyper Text Markup Language', true),
('option_1_1_2_id', 'question_1_1_id', 'Hyperlinks and Text Markup Language', false),
('option_1_1_3_id', 'question_1_1_id', 'Home Tool Markup Language', false);

-- Insert Sample Options for Question 2
INSERT INTO "Option" ("id", "questionId", "text", "isCorrect") VALUES
('option_1_2_1_id', 'question_1_2_id', 'color', true),
('option_1_2_2_id', 'question_1_2_id', 'text-color', false),
('option_1_2_3_id', 'question_1_2_id', 'font-color', false);

-- Insert Sample Progress
INSERT INTO "Progress" ("id", "userId", "courseId", "chapterId", "completed", "createdAt", "updatedAt") VALUES
('progress_1_id', 'user_1_id', 'course_1_id', 'chapter_1_1_id', true, NOW(), NOW()),
('progress_2_id', 'user_1_id', 'course_1_id', 'chapter_1_2_id', false, NOW(), NOW());

-- Insert Sample Quiz Attempts
INSERT INTO "QuizAttempt" ("id", "userId", "quizId", "score", "createdAt") VALUES
('quiz_attempt_1_id', 'user_1_id', 'quiz_1_id', 80, NOW());

-- Insert Sample Purchases
INSERT INTO "Purchase" ("id", "userId", "courseId", "createdAt") VALUES
('purchase_1_id', 'user_1_id', 'course_1_id', NOW()); 

UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'akashsinghaa008@gmail.com';
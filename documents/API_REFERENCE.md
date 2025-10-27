# 📡 API REFERENCE - Course Management Platform

**Version:** 1.0  
**Last Updated:** ${new Date().toLocaleDateString()}  
**Authentication:** NextAuth (Session-based)

---

## 📚 TABLE OF CONTENTS

1. [Enrollment API](#enrollment-api)
2. [Progress Tracking API](#progress-tracking-api)
3. [Quiz API](#quiz-api)
4. [Common Patterns](#common-patterns)
5. [Error Codes](#error-codes)

---

## 🎓 ENROLLMENT API

### Check Enrollment Status

**Endpoint:** `GET /api/courses/[courseId]/enroll`

**Authentication:** Required (Session)

**Description:** Check if the authenticated user is enrolled in a course.

**Request:**

```bash
curl -X GET "https://yourdomain.com/api/courses/123/enroll" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**Response (Enrolled):**

```json
{
  "enrolled": true,
  "courseTitle": "Complete Web Development Bootcamp",
  "courseId": "123",
  "enrolledAt": "2025-01-15T10:30:00Z"
}
```

**Response (Not Enrolled):**

```json
{
  "enrolled": false
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `404 Not Found` - Course doesn't exist
- `500 Internal Server Error` - Server error

---

### Enroll in Course

**Endpoint:** `POST /api/courses/[courseId]/enroll`

**Authentication:** Required (Session)

**Description:** Enroll authenticated user in a course. Idempotent - calling multiple times won't create duplicates.

**Request:**

```bash
curl -X POST "https://yourdomain.com/api/courses/123/enroll" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**Response (First Enrollment):**

```json
{
  "enrolled": true,
  "message": "Successfully enrolled in course"
}
```

**Response (Already Enrolled):**

```json
{
  "enrolled": true,
  "message": "Already enrolled in this course"
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Course not published yet
- `404 Not Found` - Course doesn't exist
- `500 Internal Server Error` - Server error

**Notes:**

- Enrollment is automatic and free
- No payment processing
- Creates many-to-many relation in database
- Safe to call multiple times (idempotent)

---

## 📊 PROGRESS TRACKING API

### Get User Progress

**Endpoint:** `GET /api/courses/[courseId]/progress`

**Authentication:** Required (Session)

**Description:** Retrieve user's progress for a specific course, including completion percentage and list of completed items.

**Request:**

```bash
curl -X GET "https://yourdomain.com/api/courses/123/progress" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**Response (With Progress):**

```json
{
  "courseId": "123",
  "userId": "user-456",
  "completedChapters": [
    "chapter-1",
    "chapter-2",
    "subchapter-1-1",
    "subchapter-2-1"
  ],
  "completedCount": 4,
  "totalCount": 20,
  "progressPercentage": 20,
  "isCompleted": false,
  "lastActivity": "2025-01-15T14:30:00Z"
}
```

**Response (No Progress Yet):**

```json
{
  "courseId": "123",
  "userId": "user-456",
  "completedChapters": [],
  "completedCount": 0,
  "totalCount": 20,
  "progressPercentage": 0,
  "isCompleted": false,
  "lastActivity": null
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not enrolled in course
- `404 Not Found` - Course doesn't exist
- `500 Internal Server Error` - Server error

**Notes:**

- `totalCount` includes both chapters and subchapters
- `progressPercentage` is calculated as: (completedCount / totalCount) \* 100
- `isCompleted` is true when progressPercentage = 100
- `completedChapters` contains IDs of both chapters and subchapters

---

### Update Progress

**Endpoint:** `POST /api/courses/[courseId]/progress`

**Authentication:** Required (Session)

**Description:** Mark a chapter or subchapter as complete/incomplete. Uses upsert logic - creates new record or updates existing.

**Request Body:**

```json
{
  "chapterId": "chapter-1",
  "isCompleted": true
}
```

**Request:**

```bash
curl -X POST "https://yourdomain.com/api/courses/123/progress" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "chapterId": "chapter-1",
    "isCompleted": true
  }'
```

**Response (Marked Complete):**

```json
{
  "message": "Progress saved successfully",
  "courseId": "123",
  "userId": "user-456",
  "completedCount": 5,
  "totalCount": 20,
  "progressPercentage": 25,
  "isCompleted": false,
  "lastActivity": "2025-01-15T14:35:00Z"
}
```

**Response (Marked Incomplete):**

```json
{
  "message": "Item marked as incomplete",
  "courseId": "123",
  "userId": "user-456",
  "completedCount": 4,
  "totalCount": 20,
  "progressPercentage": 20,
  "isCompleted": false,
  "lastActivity": "2025-01-15T14:36:00Z"
}
```

**Error Responses:**

- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not enrolled in course
- `404 Not Found` - Chapter not found in this course
- `500 Internal Server Error` - Server error

**Notes:**

- Works for both chapters and subchapters
- Uses upsert: creates new record or updates existing
- Updates `lastActivity` timestamp
- Validates chapter belongs to course
- Automatically recalculates progress percentage

---

## 🎯 QUIZ API

### Get Quiz Questions

**Endpoint:** `GET /api/courses/[courseId]/quiz/[quizId]`

**Authentication:** Required (Session)

**Description:** Fetch quiz questions for taking. **IMPORTANT:** Does NOT include correct answers for security.

**Request:**

```bash
curl -X GET "https://yourdomain.com/api/courses/123/quiz/quiz-456" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**Response:**

```json
{
  "quiz": {
    "id": "quiz-456",
    "title": "Introduction to JavaScript - Quiz 1",
    "chapterId": "chapter-1",
    "courseId": "123"
  },
  "questions": [
    {
      "id": "q1",
      "text": "What is the output of: console.log(typeof null)?",
      "type": "multiple-choice",
      "options": {
        "A": "null",
        "B": "object",
        "C": "undefined",
        "D": "number"
      },
      "points": 5
      // NOTE: No "answer" field (security)
    },
    {
      "id": "q2",
      "text": "Which keyword is used to declare a constant?",
      "type": "multiple-choice",
      "options": {
        "A": "var",
        "B": "let",
        "C": "const",
        "D": "static"
      },
      "points": 5
    }
  ],
  "previousAttempts": [
    {
      "attemptNumber": 1,
      "score": 75,
      "passed": true,
      "earnedPoints": 75,
      "totalPoints": 100,
      "submittedAt": "2025-01-14T10:00:00Z"
    }
  ],
  "bestScore": 75,
  "attemptsRemaining": 2,
  "totalQuestions": 20,
  "totalPoints": 100
}
```

**Error Responses:**

- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not enrolled in course
- `404 Not Found` - Quiz or course doesn't exist
- `500 Internal Server Error` - Server error

**Security Notes:**

- ✅ Correct answers are NEVER sent to frontend
- ✅ Answers only revealed after submission
- ✅ No way to view answers in browser DevTools
- ✅ Server-side validation only

---

### Submit Quiz Answers

**Endpoint:** `POST /api/courses/[courseId]/quiz/[quizId]`

**Authentication:** Required (Session)

**Description:** Submit quiz answers for grading. Returns score and detailed results with correct answers.

**Request Body:**

```json
{
  "answers": {
    "q1": "B",
    "q2": "C",
    "q3": "A"
  }
}
```

**Request:**

```bash
curl -X POST "https://yourdomain.com/api/courses/123/quiz/quiz-456" \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "answers": {
      "q1": "B",
      "q2": "C",
      "q3": "A"
    }
  }'
```

**Response (Passed):**

```json
{
  "message": "Congratulations! You passed the quiz!",
  "attemptId": "attempt-789",
  "score": 85,
  "correctAnswers": 17,
  "totalQuestions": 20,
  "earnedPoints": 85,
  "totalPoints": 100,
  "passed": true,
  "passingScore": 70,
  "gradedAnswers": {
    "q1": {
      "correct": true,
      "userAnswer": "B",
      "correctAnswer": "B"
    },
    "q2": {
      "correct": true,
      "userAnswer": "C",
      "correctAnswer": "C"
    },
    "q3": {
      "correct": false,
      "userAnswer": "A",
      "correctAnswer": "D"
    }
  },
  "submittedAt": "2025-01-15T15:00:00Z"
}
```

**Response (Failed):**

```json
{
  "message": "You did not pass this time. Keep practicing!",
  "attemptId": "attempt-790",
  "score": 55,
  "correctAnswers": 11,
  "totalQuestions": 20,
  "earnedPoints": 55,
  "totalPoints": 100,
  "passed": false,
  "passingScore": 70,
  "gradedAnswers": {
    /* ... */
  },
  "submittedAt": "2025-01-15T15:05:00Z"
}
```

**Error Responses:**

- `400 Bad Request` - Missing answers or invalid format
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not enrolled in course
- `404 Not Found` - Quiz or course doesn't exist
- `500 Internal Server Error` - Server error

**Notes:**

- Passing score is 70% (configurable per quiz in future)
- Score is calculated server-side (no client manipulation)
- Attempt is saved to database immediately
- Automatically updates leaderboard
- Maximum 3 attempts per quiz (soft limit, not enforced yet)
- Graded answers show what you got wrong

---

## 🔄 COMMON PATTERNS

### Authentication Flow

All API endpoints use NextAuth session-based authentication:

```typescript
// Get session
const session = await getServerSession(authOptions);

// Check authentication
if (!session?.user?.id) {
  return NextResponse.json(
    { error: "Please sign in to continue" },
    { status: 401 }
  );
}

// Use user ID
const userId = session.user.id;
```

### Error Handling

All endpoints follow consistent error handling:

```typescript
try {
  // API logic here
} catch (error) {
  console.error("Error in API:", error);
  return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
}
```

### Idempotent Operations

Enrollment and Progress APIs are idempotent:

- Enrolling twice doesn't create duplicates
- Marking complete twice updates the same record
- Safe to retry failed requests

---

## ⚠️ ERROR CODES

### HTTP Status Codes

| Code | Meaning               | When Used                                          |
| ---- | --------------------- | -------------------------------------------------- |
| 200  | OK                    | Successful request                                 |
| 400  | Bad Request           | Missing or invalid data                            |
| 401  | Unauthorized          | Not authenticated (no session)                     |
| 403  | Forbidden             | Authenticated but not allowed (e.g., not enrolled) |
| 404  | Not Found             | Resource doesn't exist (course, quiz, chapter)     |
| 500  | Internal Server Error | Something went wrong on server                     |

### Error Response Format

All errors return JSON with helpful message:

```json
{
  "error": "Descriptive error message for frontend display"
}
```

### Common Errors

**"Please sign in to continue"** (401)

- User is not authenticated
- Session expired
- Action: Redirect to login page

**"You must be enrolled in this course"** (403)

- User is logged in but not enrolled
- Action: Show enrollment button

**"Course not found"** (404)

- Invalid course ID
- Course was deleted
- Action: Show 404 page or redirect

**"Chapter not found in this course"** (404)

- Invalid chapter ID
- Chapter doesn't belong to this course
- Action: Refresh course data

**"Course is not yet published"** (403)

- Course is in draft mode
- Action: Show "Coming Soon" message

---

## 🔐 SECURITY CONSIDERATIONS

### Authentication

- All endpoints require authentication via NextAuth session
- User ID extracted from session (not from request body)
- No way to access other users' data

### Authorization

- Enrollment checked before saving progress
- Enrollment checked before taking quiz
- Quiz answers validated server-side only

### Data Validation

- All inputs validated (course ID, chapter ID, quiz ID)
- Type checking on all request bodies
- Database lookups validate relationships

### Quiz Security

- Correct answers NEVER sent to frontend
- Answer validation happens server-side
- Score calculated server-side
- No client-side answer checking
- Answers only revealed after submission

---

## 📝 USAGE EXAMPLES

### Frontend Integration

#### Example 1: Enroll User

```typescript
// components/EnrollButton.tsx
const handleEnroll = async () => {
  setLoading(true);

  try {
    const res = await fetch(`/api/courses/${courseId}/enroll`, {
      method: "POST",
    });

    const data = await res.json();

    if (res.ok) {
      toast.success(data.message);
      router.push(`/courses/${courseId}/learn`);
    } else {
      toast.error(data.error);
    }
  } catch (error) {
    toast.error("Failed to enroll");
  } finally {
    setLoading(false);
  }
};
```

#### Example 2: Update Progress

```typescript
// components/ChapterCheckbox.tsx
const handleToggleComplete = async (
  chapterId: string,
  isCompleted: boolean
) => {
  // Optimistic update
  setProgress((prev) => ({
    ...prev,
    completedChapters: isCompleted
      ? [...prev.completedChapters, chapterId]
      : prev.completedChapters.filter((id) => id !== chapterId),
  }));

  try {
    const res = await fetch(`/api/courses/${courseId}/progress`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapterId, isCompleted }),
    });

    const data = await res.json();

    if (res.ok) {
      setProgress(data);
      toast.success("Progress updated");
    } else {
      // Revert on error
      fetchProgress();
      toast.error(data.error);
    }
  } catch (error) {
    // Revert on error
    fetchProgress();
    toast.error("Failed to update progress");
  }
};
```

#### Example 3: Submit Quiz

```typescript
// pages/quiz/[quizId]/page.tsx
const handleSubmit = async () => {
  if (Object.keys(answers).length !== questions.length) {
    toast.error("Please answer all questions");
    return;
  }

  setSubmitting(true);

  try {
    const res = await fetch(`/api/courses/${courseId}/quiz/${quizId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers }),
    });

    const data = await res.json();

    if (res.ok) {
      setQuizResult(data);
      setShowResults(true);

      if (data.passed) {
        toast.success("Congratulations! You passed!");
      } else {
        toast.info("Try again to improve your score");
      }
    } else {
      toast.error(data.error);
    }
  } catch (error) {
    toast.error("Failed to submit quiz");
  } finally {
    setSubmitting(false);
  }
};
```

---

## 🚀 RATE LIMITING (Future Enhancement)

Rate limiting is not currently implemented but recommended for production:

**Recommended Limits:**

- Enrollment: 10 requests per minute per user
- Progress: 60 requests per minute per user
- Quiz submission: 5 requests per hour per user

**Implementation Options:**

- Vercel: Built-in rate limiting
- upstash-ratelimit: Redis-based rate limiting
- Custom middleware: Track in database

---

## 📊 MONITORING (Recommended)

### Metrics to Track

- API response times (target: < 500ms)
- Error rates by endpoint
- Authentication failures
- Quiz submission volume
- Progress update frequency

### Tools

- Vercel Analytics (built-in)
- Sentry (error tracking)
- Prisma Query Insights
- Custom logging middleware

---

**API Version:** 1.0  
**Last Updated:** ${new Date().toLocaleDateString()}  
**Maintained By:** Development Team

For deployment information, see: `DEPLOYMENT_CHECKLIST.md` and `QUICK_DEPLOYMENT_GUIDE.md`

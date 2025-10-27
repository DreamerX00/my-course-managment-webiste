# 🧪 API TESTING GUIDE

**Quick reference for testing the newly created APIs**

---

## 🚀 Prerequisites

1. Start development server:

```bash
npm run dev
```

2. Get your authentication cookie:

- Login at http://localhost:3000/login
- Open browser DevTools → Application → Cookies
- Copy the `next-auth.session-token` value

---

## 📋 Test Scenarios

### 1. AUTO-ENROLLMENT API

#### Get Enrollment Status (No Auth Required)

```bash
curl http://localhost:3000/api/courses/YOUR_COURSE_ID/enroll
```

**Expected Response:**

```json
{
  "enrolled": false,
  "courseId": "YOUR_COURSE_ID"
}
```

#### Enroll in Course (Auth Required)

```bash
curl -X POST http://localhost:3000/api/courses/YOUR_COURSE_ID/enroll \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**Expected Response:**

```json
{
  "message": "Successfully enrolled in course",
  "enrolled": true,
  "courseId": "YOUR_COURSE_ID",
  "courseTitle": "Course Name",
  "enrolledAt": "2025-01-15T..."
}
```

#### Check Enrollment Again

```bash
curl http://localhost:3000/api/courses/YOUR_COURSE_ID/enroll \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**Expected Response:**

```json
{
  "enrolled": true,
  "courseId": "YOUR_COURSE_ID",
  "courseTitle": "Course Name"
}
```

---

### 2. PROGRESS TRACKING API

#### Get Initial Progress

```bash
curl http://localhost:3000/api/courses/YOUR_COURSE_ID/progress \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**Expected Response:**

```json
{
  "courseId": "YOUR_COURSE_ID",
  "userId": "YOUR_USER_ID",
  "completedChapters": [],
  "completedCount": 0,
  "totalCount": 10,
  "progressPercentage": 0,
  "isCompleted": false,
  "lastActivity": null
}
```

#### Mark Chapter as Complete

```bash
curl -X POST http://localhost:3000/api/courses/YOUR_COURSE_ID/progress \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "chapterId": "YOUR_CHAPTER_ID",
    "isCompleted": true
  }'
```

**Expected Response:**

```json
{
  "message": "Progress saved",
  "chapterId": "YOUR_CHAPTER_ID",
  "isCompleted": true,
  "progressPercentage": 10,
  "completedCount": 1,
  "totalCount": 10,
  "updatedAt": "2025-01-15T..."
}
```

#### Get Updated Progress

```bash
curl http://localhost:3000/api/courses/YOUR_COURSE_ID/progress \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**Expected Response:**

```json
{
  "completedChapters": ["YOUR_CHAPTER_ID"],
  "completedCount": 1,
  "progressPercentage": 10
}
```

---

### 3. QUIZ FLOW API

#### Get Quiz Questions

```bash
curl http://localhost:3000/api/courses/YOUR_COURSE_ID/quiz/YOUR_QUIZ_ID \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

**Expected Response:**

```json
{
  "id": "YOUR_QUIZ_ID",
  "title": "Quiz Title",
  "totalQuestions": 5,
  "totalPoints": 100,
  "questions": [
    {
      "id": "q1",
      "text": "What is 2+2?",
      "type": "multiple-choice",
      "options": [
        { "id": "a", "text": "3" },
        { "id": "b", "text": "4" },
        { "id": "c", "text": "5" }
      ],
      "points": 20
    }
  ],
  "previousAttempts": [],
  "attemptsRemaining": 3
}
```

⚠️ **Security Check:** Verify that `answer` field is NOT in the response!

#### Submit Quiz Answers

```bash
curl -X POST http://localhost:3000/api/courses/YOUR_COURSE_ID/quiz/YOUR_QUIZ_ID \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "answers": {
      "q1": "b",
      "q2": "a",
      "q3": "c",
      "q4": "b",
      "q5": "a"
    }
  }'
```

**Expected Response:**

```json
{
  "message": "Quiz passed!",
  "attemptId": "attempt_123",
  "score": 80,
  "correctAnswers": 4,
  "totalQuestions": 5,
  "earnedPoints": 80,
  "totalPoints": 100,
  "passed": true,
  "passingScore": 70,
  "gradedAnswers": {
    "q1": { "correct": true, "userAnswer": "b", "correctAnswer": "b" },
    "q2": { "correct": false, "userAnswer": "a", "correctAnswer": "c" }
  },
  "submittedAt": "2025-01-15T..."
}
```

---

## 🎯 Full User Flow Test

Test the complete user journey:

```bash
# 1. Enroll in course
curl -X POST http://localhost:3000/api/courses/YOUR_COURSE_ID/enroll \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# 2. Mark first chapter as complete
curl -X POST http://localhost:3000/api/courses/YOUR_COURSE_ID/progress \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"chapterId": "CHAPTER_1", "isCompleted": true}'

# 3. Get quiz questions
curl http://localhost:3000/api/courses/YOUR_COURSE_ID/quiz/QUIZ_1 \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# 4. Submit quiz
curl -X POST http://localhost:3000/api/courses/YOUR_COURSE_ID/quiz/QUIZ_1 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"answers": {"q1": "a", "q2": "b"}}'

# 5. Check progress
curl http://localhost:3000/api/courses/YOUR_COURSE_ID/progress \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"

# 6. Check leaderboard
curl http://localhost:3000/api/leaderboard \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

---

## 🔍 Database Verification

After each API call, verify in the database:

### Check Enrollment

```sql
SELECT * FROM "Course"
WHERE id = 'YOUR_COURSE_ID';

-- Should see user in students relation
```

### Check Progress

```sql
SELECT * FROM "Progress"
WHERE "userId" = 'YOUR_USER_ID'
AND "courseId" = 'YOUR_COURSE_ID';
```

### Check Quiz Attempt

```sql
SELECT * FROM "QuizAttempt"
WHERE "userId" = 'YOUR_USER_ID'
AND "quizId" = 'YOUR_QUIZ_ID'
ORDER BY "createdAt" DESC;
```

---

## ❌ Error Testing

Test error scenarios:

### 401 Unauthorized

```bash
# Try without authentication
curl http://localhost:3000/api/courses/YOUR_COURSE_ID/progress
```

### 403 Forbidden

```bash
# Try to save progress without enrollment
curl -X POST http://localhost:3000/api/courses/YOUR_COURSE_ID/progress \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{"chapterId": "INVALID", "isCompleted": true}'
```

### 404 Not Found

```bash
# Try with invalid course ID
curl http://localhost:3000/api/courses/INVALID_ID/enroll
```

---

## ✅ Success Criteria

All tests pass when:

- [ ] Enrollment works and returns proper response
- [ ] Progress saves to database
- [ ] Progress percentage calculates correctly
- [ ] Quiz questions fetch WITHOUT answers
- [ ] Quiz submission calculates score correctly
- [ ] QuizAttempt saves to database
- [ ] Score appears in leaderboard
- [ ] All error cases return proper status codes
- [ ] No console errors in terminal

---

## 🐛 Common Issues

### Issue: 401 Unauthorized

**Solution:** Make sure you're logged in and copied the correct session token

### Issue: 404 Course not found

**Solution:** Create a course first in admin dashboard

### Issue: Foreign key constraint error

**Solution:** Make sure chapter/quiz belongs to the course

### Issue: Score not in leaderboard

**Solution:** The leaderboard automatically updates via database relations. Refresh the leaderboard page.

---

## 📊 Using Postman

1. Import these requests as a Postman collection
2. Set environment variable `{{baseUrl}}` = `http://localhost:3000`
3. Set environment variable `{{courseId}}` = Your course ID
4. Set environment variable `{{authToken}}` = Your session token
5. Run collection to test all endpoints

---

**Happy Testing! 🎉**

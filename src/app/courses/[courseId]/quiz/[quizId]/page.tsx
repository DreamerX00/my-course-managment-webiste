"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle2,
  XCircle,
  Trophy,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface QuizQuestion {
  id: string;
  text: string;
  type: string;
  options: Array<{ id: string; text: string }>;
  points: number;
}

interface QuizData {
  id: string;
  title: string;
  chapterId: string;
  questions: QuizQuestion[];
  totalPoints: number;
  previousAttempts: Array<{
    score: number;
    passed: boolean;
    submittedAt: string;
  }>;
  attemptsRemaining: number;
}

interface GradedAnswer {
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
}

interface QuizResult {
  message: string;
  attemptId: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  earnedPoints: number;
  totalPoints: number;
  passed: boolean;
  passingScore: number;
  gradedAnswers: Record<string, GradedAnswer>;
  submittedAt: string;
}

export default function QuizTakingPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const quizId = params.quizId as string;
  const router = useRouter();
  const { status } = useSession();
  const { toast } = useToast();

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      if (status !== "authenticated") return;

      try {
        setIsLoading(true);
        const response = await fetch(`/api/courses/${courseId}/quiz/${quizId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch quiz");
        }

        const data = await response.json();
        setQuiz(data);
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Failed to load quiz",
          variant: "destructive",
        });
        router.push(`/courses/${courseId}/learn`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuiz();
  }, [courseId, quizId, status, toast, router]);

  // Handle answer selection
  const handleAnswerSelect = (questionId: string, answerId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: answerId,
    }));
  };

  // Handle quiz submission
  const handleSubmit = async () => {
    if (!quiz) return;

    // Check if all questions are answered
    const unansweredCount = quiz.questions.length - Object.keys(answers).length;
    if (unansweredCount > 0) {
      toast({
        title: "Incomplete Quiz",
        description: `Please answer all questions. ${unansweredCount} question(s) remaining.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/courses/${courseId}/quiz/${quizId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to submit quiz");
      }

      const result = await response.json();
      setQuizResult(result);
      setShowResults(true);

      toast({
        title: result.passed ? "Congratulations!" : "Quiz Completed",
        description: result.message,
        variant: result.passed ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-2xl font-semibold">Loading quiz...</h2>
        </div>
      </div>
    );
  }

  // Quiz not found
  if (!quiz) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Quiz not found</h2>
          <Button onClick={() => router.push(`/courses/${courseId}/learn`)}>
            Return to Course
          </Button>
        </div>
      </div>
    );
  }

  // Results page
  if (showResults && quizResult) {
    return (
      <div className="container py-10">
        <div className="max-w-3xl mx-auto">
          <Card className="border-2">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {quizResult.passed ? (
                  <Trophy className="w-16 h-16 text-yellow-500" />
                ) : (
                  <XCircle className="w-16 h-16 text-red-500" />
                )}
              </div>
              <CardTitle className="text-3xl">
                {quizResult.passed ? "Congratulations!" : "Keep Practicing"}
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                {quizResult.message}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Score Overview */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {quizResult.score}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Score</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {quizResult.correctAnswers}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Correct</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {quizResult.earnedPoints}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Points</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">
                    {quizResult.passingScore}%
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Passing</div>
                </div>
              </div>

              {/* Detailed Results */}
              <div>
                <h3 className="text-xl font-semibold mb-4">Question Results</h3>
                <div className="space-y-3">
                  {quiz.questions.map((question, index) => {
                    const graded = quizResult.gradedAnswers[question.id];
                    if (!graded) return null;

                    return (
                      <div
                        key={question.id}
                        className={`p-4 rounded-lg border-2 ${
                          graded.correct
                            ? "bg-green-50 border-green-200"
                            : "bg-red-50 border-red-200"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {graded.correct ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium mb-2">
                              Question {index + 1}: {question.text}
                            </p>
                            <div className="text-sm space-y-1">
                              <p>
                                <span className="font-semibold">
                                  Your answer:
                                </span>{" "}
                                <span
                                  className={
                                    graded.correct
                                      ? "text-green-700"
                                      : "text-red-700"
                                  }
                                >
                                  {graded.userAnswer}
                                </span>
                              </p>
                              {!graded.correct && (
                                <p>
                                  <span className="font-semibold">
                                    Correct answer:
                                  </span>{" "}
                                  <span className="text-green-700">
                                    {graded.correctAnswer}
                                  </span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <Button
                  onClick={() => router.push(`/courses/${courseId}/learn`)}
                  variant="outline"
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Course
                </Button>
                {!quizResult.passed && quiz.attemptsRemaining > 0 && (
                  <Button
                    onClick={() => {
                      setShowResults(false);
                      setQuizResult(null);
                      setAnswers({});
                      setCurrentQuestionIndex(0);
                    }}
                    className="flex-1"
                  >
                    Try Again ({quiz.attemptsRemaining - 1} attempts left)
                  </Button>
                )}
                <Button
                  onClick={() => router.push("/leaderboard")}
                  variant="default"
                  className="flex-1"
                >
                  <Trophy className="w-4 h-4 mr-2" />
                  View Leaderboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Quiz taking interface
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="container py-10">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push(`/courses/${courseId}/learn`)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Button>
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          {quiz.previousAttempts.length > 0 && (
            <p className="text-sm text-gray-600 mt-2">
              Previous attempts: {quiz.previousAttempts.length} | Best score:{" "}
              {Math.max(...quiz.previousAttempts.map((a) => a.score))}%
            </p>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
            </span>
            <span>
              {answeredCount} / {quiz.questions.length} answered
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{currentQuestion.text}</CardTitle>
            <CardDescription>
              Worth {currentQuestion.points} point
              {currentQuestion.points !== 1 ? "s" : ""}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.id}
                onClick={() =>
                  handleAnswerSelect(currentQuestion.id, option.id)
                }
                className={`w-full text-left p-4 border-2 rounded-lg transition-all ${
                  answers[currentQuestion.id] === option.id
                    ? "bg-blue-50 border-blue-500 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion.id] === option.id
                        ? "border-blue-500 bg-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    {answers[currentQuestion.id] === option.id && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <span className="flex-1">{option.text}</span>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          {currentQuestionIndex === quiz.questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || answeredCount !== quiz.questions.length}
              className="min-w-[140px]"
            >
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </Button>
          ) : (
            <Button onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>

        {/* Warning if not all answered */}
        {currentQuestionIndex === quiz.questions.length - 1 &&
          answeredCount !== quiz.questions.length && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ Please answer all questions before submitting.{" "}
                {quiz.questions.length - answeredCount} question(s) remaining.
              </p>
            </div>
          )}
      </div>
    </div>
  );
}

"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface Question {
  id: string
  text: string
  options: {
    id: string
    text: string
  }[]
  correctOptionId: string
}

interface Quiz {
  id: string
  title: string
  description: string
  questions: Question[]
}

export default function QuizPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter()
  const { status } = useSession()
  const { toast } = useToast()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    }
  }, [status, router])

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch(`/api/courses/${courseId}/quiz`)
        if (!response.ok) {
          throw new Error("Failed to fetch quiz")
        }
        const data = await response.json()
        setQuiz(data)
      } catch {
        toast({
          title: "Error",
          description: "Failed to load quiz",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuiz()
  }, [courseId, toast])

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [questionId]: optionId,
    }))
  }

  const handleSubmit = async () => {
    if (!quiz) return

    setIsSubmitting(true)
    let correctAnswers = 0

    quiz.questions.forEach((question) => {
      if (selectedOptions[question.id] === question.correctOptionId) {
        correctAnswers++
      }
    })

    const finalScore = (correctAnswers / quiz.questions.length) * 100
    setScore(finalScore)

    try {
      await fetch(`/api/courses/${courseId}/quiz/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          score: finalScore,
          answers: selectedOptions,
        }),
      })

      setShowResults(true)
    } catch {
      toast({
        title: "Error",
        description: "Failed to submit quiz",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Loading...</h2>
        </div>
      </div>
    )
  }

  if (!quiz) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">Quiz not found</h2>
        </div>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="container py-10">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Quiz Results</h1>
          <div className="text-4xl font-bold mb-8">{score.toFixed(1)}%</div>
          <Button onClick={() => router.push(`/courses/${courseId}/learn`)}>
            Return to Course
          </Button>
        </div>
      </div>
    )
  }

  const currentQuestion = quiz.questions[currentQuestionIndex]

  return (
    <div className="container py-10">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{quiz.title}</h1>
          <p className="mt-2 text-muted-foreground">{quiz.description}</p>
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </h2>
              <div className="text-sm text-muted-foreground">
                {Object.keys(selectedOptions).length} of {quiz.questions.length} answered
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-lg">{currentQuestion.text}</p>
              <div className="space-y-2">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(currentQuestion.id, option.id)}
                    className={`w-full text-left p-4 border rounded-lg transition-colors ${
                      selectedOptions[currentQuestion.id] === option.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                    }`}
                  >
                    {option.text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentQuestionIndex((prev) => prev - 1)}
              disabled={currentQuestionIndex === 0}
            >
              Previous
            </Button>
            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <Button
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  Object.keys(selectedOptions).length !== quiz.questions.length
                }
              >
                {isSubmitting ? "Submitting..." : "Submit Quiz"}
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentQuestionIndex((prev) => prev + 1)}
                disabled={!selectedOptions[currentQuestion.id]}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
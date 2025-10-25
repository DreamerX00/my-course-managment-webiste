"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useRouter, useParams } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { 
  Save, 
  RotateCcw, 
  ArrowLeft,
  Plus,
  X,
  FileText,
  Clock,
  Users,
  Star,
  Video,
  FileCode,
  MessageSquare,
  Smartphone,
  Trophy,
  BookOpen
} from "lucide-react"
import { EditorContent, useEditor } from '@tiptap/react'
import { editorExtensions } from "@/lib/tiptap-extensions"

// Default content details template
const defaultContentDetails = {
  title: "DSA Cracker 🔥 - Complete Data Structures & Algorithms",
  category: "Computer Science",
  tags: ["DSA", "Beginner", "Interview Prep", "Popular"],
  instructor: {
    name: "Dreamer X",
    avatar: "https://media.licdn.com/dms/image/v2/D5603AQESvarmSkAJlg/profile-displayphoto-shrink_400_400/B56ZVSx_uRHoAk-/0/1740850594111?e=1755734400&v=beta&t=AJLi2kkgpMLthVAjhaHVKz1i8GTpf-7IlcyeK_cJPy8",
    rating: 4.8,
    students: 15420
  },
  rating: 4.9,
  enrolledCount: 28450,
  duration: "45 hours",
  price: 999,
  originalPrice: 1999,
  isFree: false,
  description: `
    <h2>Master Data Structures and Algorithms</h2>
    <p>This comprehensive course will take you from a complete beginner to an advanced DSA expert. Perfect for:</p>
    <ul>
      <li>🎯 <strong>Interview Preparation:</strong> Crack coding interviews at top tech companies</li>
      <li>🏆 <strong>Competitive Programming:</strong> Excel in coding competitions</li>
      <li>💼 <strong>Career Growth:</strong> Build a strong foundation for software development</li>
      <li>🧠 <strong>Problem Solving:</strong> Develop analytical thinking skills</li>
    </ul>
    
    <h3>What You'll Learn</h3>
    <p>By the end of this course, you'll be able to:</p>
    <ul>
      <li>Implement all major data structures from scratch</li>
      <li>Solve complex algorithmic problems efficiently</li>
      <li>Analyze time and space complexity of solutions</li>
      <li>Apply DSA concepts to real-world problems</li>
      <li>Ace technical interviews with confidence</li>
    </ul>
    
    <h3>Course Structure</h3>
    <p>We'll cover everything systematically:</p>
    <ol>
      <li><strong>Arrays & Strings:</strong> Foundation concepts and manipulation</li>
      <li><strong>Linked Lists:</strong> Dynamic data structures</li>
      <li><strong>Stacks & Queues:</strong> LIFO and FIFO operations</li>
      <li><strong>Trees & Graphs:</strong> Hierarchical and network data</li>
      <li><strong>Dynamic Programming:</strong> Optimization techniques</li>
    </ol>
  `,
  features: [
    {
      icon: "Video",
      title: "Video Content",
      description: "45 hours of on-demand videos",
      value: "45 hours"
    },
    {
      icon: "FileText",
      title: "Resources",
      description: "Downloadable resources and notes",
      value: "50+ files"
    },
    {
      icon: "FileCode",
      title: "Assignments",
      description: "Practice problems and coding challenges",
      value: "200+ problems"
    },
    {
      icon: "MessageSquare",
      title: "Instructor Support",
      description: "Direct Q&A and doubt solving",
      value: "24/7 support"
    },
    {
      icon: "Smartphone",
      title: "Access",
      description: "Full lifetime access on mobile & TV",
      value: "Lifetime"
    },
    {
      icon: "Trophy",
      title: "Certificate",
      description: "Certificate of Completion included",
      value: "Included"
    }
  ]
}

const iconMap = {
  Video,
  FileText,
  FileCode,
  MessageSquare,
  Smartphone,
  Trophy,
  BookOpen,
  Clock,
  Users,
  Star
}

export default function CourseContentDetailsPage() {
  const params = useParams();
  const courseId = params.courseId as string;
  const router = useRouter()
  const { toast } = useToast()
  const [contentDetails, setContentDetails] = useState(defaultContentDetails)
  const [loading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newTag, setNewTag] = useState("")
  const [newFeature, setNewFeature] = useState({
    icon: "Video",
    title: "",
    description: "",
    value: ""
  })

  // TipTap editor for description
  const editor = useEditor({
    extensions: editorExtensions,
    content: contentDetails.description,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      setContentDetails(prev => ({
        ...prev,
        description: editor.getHTML()
      }))
    }
  })

  const handleSave = async () => {
    if (!courseId) return
    setSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/admin/courses/${courseId}/details`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contentDetails)
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Content details saved successfully!",
        })
      } else {
        throw new Error('Failed to save content details')
      }
    } catch {
      setError('Failed to save content details')
      toast({
        title: "Error",
        description: "Failed to save content details. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setContentDetails(defaultContentDetails)
    if (editor) {
      editor.commands.setContent(defaultContentDetails.description)
    }
    toast({
      title: "Reset",
      description: "Content details reset to default template.",
    })
  }

  const addTag = () => {
    if (newTag.trim() && !contentDetails.tags.includes(newTag.trim())) {
      setContentDetails(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setContentDetails(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  const addFeature = () => {
    if (newFeature.title && newFeature.description && newFeature.value) {
      setContentDetails(prev => ({
        ...prev,
        features: [...prev.features, { ...newFeature }]
      }))
      setNewFeature({
        icon: "Video",
        title: "",
        description: "",
        value: ""
      })
    }
  }

  const removeFeature = (index: number) => {
    setContentDetails(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-yellow-50 to-pink-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">Loading content details...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-yellow-50 to-pink-50 p-8 pt-24">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manage Content Details</h1>
              <p className="text-gray-600">Course ID: {courseId}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleReset}
              className="flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Reset to Default
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700"
          >
            {error}
          </motion.div>
        )}

        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Course Title</Label>
                  <Input
                    id="title"
                    value={contentDetails.title}
                    onChange={(e) => setContentDetails(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter course title"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={contentDetails.category}
                    onChange={(e) => setContentDetails(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g., Computer Science"
                  />
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mt-2 mb-3">
                  {contentDetails.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="ml-1 hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add new tag"
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag} variant="outline" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Instructor Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Instructor Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="instructorName">Instructor Name</Label>
                  <Input
                    id="instructorName"
                    value={contentDetails.instructor.name}
                    onChange={(e) => setContentDetails(prev => ({
                      ...prev,
                      instructor: { ...prev.instructor, name: e.target.value }
                    }))}
                    placeholder="Instructor name"
                  />
                </div>
                <div>
                  <Label htmlFor="instructorAvatar">Avatar URL</Label>
                  <Input
                    id="instructorAvatar"
                    value={contentDetails.instructor.avatar}
                    onChange={(e) => setContentDetails(prev => ({
                      ...prev,
                      instructor: { ...prev.instructor, avatar: e.target.value }
                    }))}
                    placeholder="Avatar image URL"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="instructorRating">Instructor Rating</Label>
                  <Input
                    id="instructorRating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={contentDetails.instructor.rating}
                    onChange={(e) => setContentDetails(prev => ({
                      ...prev,
                      instructor: { ...prev.instructor, rating: parseFloat(e.target.value) }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="instructorStudents">Student Count</Label>
                  <Input
                    id="instructorStudents"
                    type="number"
                    value={contentDetails.instructor.students}
                    onChange={(e) => setContentDetails(prev => ({
                      ...prev,
                      instructor: { ...prev.instructor, students: parseInt(e.target.value) }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="courseRating">Course Rating</Label>
                  <Input
                    id="courseRating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="5"
                    value={contentDetails.rating}
                    onChange={(e) => setContentDetails(prev => ({
                      ...prev,
                      rating: parseFloat(e.target.value)
                    }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Course Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={contentDetails.duration}
                    onChange={(e) => setContentDetails(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="e.g., 45 hours"
                  />
                </div>
                <div>
                  <Label htmlFor="enrolledCount">Enrolled Count</Label>
                  <Input
                    id="enrolledCount"
                    type="number"
                    value={contentDetails.enrolledCount}
                    onChange={(e) => setContentDetails(prev => ({
                      ...prev,
                      enrolledCount: parseInt(e.target.value)
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={contentDetails.price}
                    onChange={(e) => setContentDetails(prev => ({
                      ...prev,
                      price: parseInt(e.target.value)
                    }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="originalPrice">Original Price (₹)</Label>
                  <Input
                    id="originalPrice"
                    type="number"
                    value={contentDetails.originalPrice}
                    onChange={(e) => setContentDetails(prev => ({
                      ...prev,
                      originalPrice: parseInt(e.target.value)
                    }))}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="isFree"
                    type="checkbox"
                    checked={contentDetails.isFree}
                    onChange={(e) => setContentDetails(prev => ({
                      ...prev,
                      isFree: e.target.checked
                    }))}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isFree">Free Course</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Course Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {contentDetails.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                      <select
                        value={feature.icon}
                        onChange={(e) => {
                          const newFeatures = [...contentDetails.features]
                          newFeatures[index].icon = e.target.value
                          setContentDetails(prev => ({ ...prev, features: newFeatures }))
                        }}
                        className="border rounded px-2 py-1"
                      >
                        {Object.keys(iconMap).map(iconName => (
                          <option key={iconName} value={iconName}>{iconName}</option>
                        ))}
                      </select>
                      <Input
                        value={feature.title}
                        onChange={(e) => {
                          const newFeatures = [...contentDetails.features]
                          newFeatures[index].title = e.target.value
                          setContentDetails(prev => ({ ...prev, features: newFeatures }))
                        }}
                        placeholder="Feature title"
                      />
                      <Input
                        value={feature.description}
                        onChange={(e) => {
                          const newFeatures = [...contentDetails.features]
                          newFeatures[index].description = e.target.value
                          setContentDetails(prev => ({ ...prev, features: newFeatures }))
                        }}
                        placeholder="Feature description"
                      />
                      <Input
                        value={feature.value}
                        onChange={(e) => {
                          const newFeatures = [...contentDetails.features]
                          newFeatures[index].value = e.target.value
                          setContentDetails(prev => ({ ...prev, features: newFeatures }))
                        }}
                        placeholder="Value (e.g., 45 hours)"
                      />
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeFeature(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Separator />
              
              <div className="space-y-3">
                <h4 className="font-semibold">Add New Feature</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                  <select
                    value={newFeature.icon}
                    onChange={(e) => setNewFeature(prev => ({ ...prev, icon: e.target.value }))}
                    className="border rounded px-2 py-1"
                  >
                    {Object.keys(iconMap).map(iconName => (
                      <option key={iconName} value={iconName}>{iconName}</option>
                    ))}
                  </select>
                  <Input
                    value={newFeature.title}
                    onChange={(e) => setNewFeature(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Feature title"
                  />
                  <Input
                    value={newFeature.description}
                    onChange={(e) => setNewFeature(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Feature description"
                  />
                  <Input
                    value={newFeature.value}
                    onChange={(e) => setNewFeature(prev => ({ ...prev, value: e.target.value }))}
                    placeholder="Value"
                  />
                </div>
                <Button onClick={addFeature} variant="outline" className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Add Feature
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Course Description */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Course Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg overflow-hidden">
                <EditorContent editor={editor} />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
} 
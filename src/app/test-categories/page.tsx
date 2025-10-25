"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function TestCategoriesPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const createSampleDetails = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const response = await fetch('/api/courses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'create-sample-details' }),
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setMessage('Sample course details created successfully! Refresh the courses page to see the changes.')
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      setMessage(`Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Test Category Filtering
          </h1>
          
          <div className="space-y-4">
            <p className="text-gray-600">
              This page helps test the category filtering functionality by creating sample course details 
              for existing courses with proper categories that match the admin-configured categories.
            </p>
            
            <Button 
              onClick={createSampleDetails}
              disabled={loading}
              className="w-full md:w-auto"
            >
              {loading ? 'Creating...' : 'Create Sample Course Details'}
            </Button>
            
            {message && (
              <div className={`p-4 rounded-md ${
                message.includes('Error') 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message}
              </div>
            )}
            
            <div className="mt-8 p-4 bg-blue-50 rounded-md">
              <h3 className="font-semibold text-blue-900 mb-2">Instructions:</h3>
              <ol className="list-decimal list-inside space-y-1 text-blue-800">
                <li>Click the button above to create sample course details</li>
                <li>Go to the <Link href="/courses" className="underline">Courses page</Link></li>
                <li>Test the category filter buttons at the top</li>
                <li>The courses should now be properly categorized and filterable</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
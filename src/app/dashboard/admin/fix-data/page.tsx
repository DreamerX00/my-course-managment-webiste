"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

export default function FixDataPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    updatedCount: number;
    totalCourses: number;
  } | null>(null);

  const handleFixInstructorData = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/fix-instructor-data", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to fix instructor data");
      }

      const data = await response.json();
      setResult(data);

      toast({
        title: "Success!",
        description: `Updated ${data.updatedCount} course(s) with correct instructor data`,
      });
    } catch (error) {
      console.error("Error fixing data:", error);
      toast({
        title: "Error",
        description: "Failed to fix instructor data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="w-6 h-6" />
              Fix Hardcoded Instructor Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">
                What does this do?
              </h3>
              <p className="text-sm text-blue-800">
                This tool will scan all courses and replace any hardcoded
                &quot;CodeWithHarry&quot; instructor data with your actual
                profile information (name and avatar from your logged-in
                account).
              </p>
            </div>

            {result && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-green-900 mb-1">
                      Update Complete!
                    </h3>
                    <p className="text-sm text-green-800">
                      Updated {result.updatedCount} out of {result.totalCourses}{" "}
                      courses
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">
                    Important Notes:
                  </h3>
                  <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                    <li>This will update ALL courses with hardcoded data</li>
                    <li>
                      Changes will be reflected immediately on the website
                    </li>
                    <li>The cache will be cleared automatically</li>
                    <li>
                      You may need to refresh the courses page to see changes
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <Button
              onClick={handleFixInstructorData}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Fixing Data...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Fix Instructor Data
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

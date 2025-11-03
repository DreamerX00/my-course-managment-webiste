"use client";
import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Edit } from "lucide-react";

export default function EditChapterPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  useEffect(() => {
    // Automatically redirect to content management page after a short delay
    const timer = setTimeout(() => {
      router.push(`/dashboard/admin/courses/${courseId}/content`);
    }, 2000);

    return () => clearTimeout(timer);
  }, [router, courseId]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-950 flex items-center justify-center">
              <Edit className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">
            Redirecting to Content Manager
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-muted-foreground text-lg">
            Chapter editing is done through our comprehensive Content Management
            system.
          </p>

          <div className="flex items-center justify-center gap-3 text-blue-600 dark:text-blue-400">
            <span className="font-semibold">Taking you there now</span>
            <ArrowRight className="w-5 h-5 animate-pulse" />
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground mb-4">
              Or click below to go immediately:
            </p>
            <button
              onClick={() =>
                router.push(`/dashboard/admin/courses/${courseId}/content`)
              }
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold"
            >
              Go to Content Manager
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

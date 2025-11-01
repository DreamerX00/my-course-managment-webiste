"use client";

import { useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // TODO: Log the error to an error reporting service (e.g., Sentry)
    // Example: Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-linear-to-br from-red-50 via-orange-50 to-yellow-50 p-4">
          {/* 500 Error Image - Full Width */}
          <div className="w-full max-w-4xl mb-8">
            <div className="relative w-full aspect-video md:aspect-[21/9]">
              <Image
                src="/Errors/500.png"
                alt="500 - Internal Server Error"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Error Details */}
          <div className="text-center mb-8 max-w-2xl px-4">
            <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-4">
              500
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
              Internal Server Error
            </h2>
            <p className="text-lg text-gray-600 mb-2">
              Something went wrong on our end. Our team has been notified.
            </p>
            {error.message && (
              <p className="text-sm text-gray-500 mt-4 font-mono bg-gray-100 p-3 rounded-lg">
                {error.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button
              onClick={() => reset()}
              size="lg"
              className="gap-2 min-w-40"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </Button>
            <Button
              onClick={() => (window.location.href = "/")}
              variant="outline"
              size="lg"
              className="gap-2 min-w-40"
            >
              <Home className="w-5 h-5" />
              Go Home
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}

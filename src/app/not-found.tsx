"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4">
      {/* 404 Error Image - Full Width */}
      <div className="w-full max-w-4xl mb-8">
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
          <Image
            src="/Errors/404.png"
            alt="404 - Page Not Found"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Error Details */}
      <div className="text-center mb-8 max-w-2xl px-4">
        <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-4">
          404
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
          Page Not Found
        </h2>
        <p className="text-lg text-gray-600">
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Button
          onClick={() => router.back()}
          size="lg"
          className="gap-2 min-w-[160px]"
        >
          <RefreshCw className="w-5 h-5" />
          Go Back
        </Button>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          size="lg"
          className="gap-2 min-w-[160px]"
        >
          <Home className="w-5 h-5" />
          Go Home
        </Button>
      </div>
    </div>
  );
}

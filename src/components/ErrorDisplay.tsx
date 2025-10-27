"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw } from "lucide-react";

interface ErrorDisplayProps {
  errorCode?:
    | "400"
    | "401"
    | "403"
    | "404"
    | "405"
    | "408"
    | "409"
    | "429"
    | "500"
    | "502"
    | "503"
    | "504";
  title?: string;
  description?: string;
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  showHome?: boolean;
}

const errorDefaults: Record<string, { title: string; description: string }> = {
  "400": {
    title: "Bad Request",
    description: "The request could not be understood by the server.",
  },
  "401": {
    title: "Unauthorized",
    description: "You need to be authenticated to access this resource.",
  },
  "403": {
    title: "Forbidden",
    description: "You don't have permission to access this resource.",
  },
  "404": {
    title: "Not Found",
    description: "The page you are looking for does not exist.",
  },
  "405": {
    title: "Method Not Allowed",
    description: "The request method is not supported for this resource.",
  },
  "408": {
    title: "Request Timeout",
    description: "The server timed out waiting for the request.",
  },
  "409": {
    title: "Conflict",
    description: "The request conflicts with the current state of the server.",
  },
  "429": {
    title: "Too Many Requests",
    description: "You have sent too many requests. Please try again later.",
  },
  "500": {
    title: "Internal Server Error",
    description: "Something went wrong on our end. Please try again.",
  },
  "502": {
    title: "Bad Gateway",
    description: "The server received an invalid response.",
  },
  "503": {
    title: "Service Unavailable",
    description:
      "The server is temporarily unavailable. Please try again later.",
  },
  "504": {
    title: "Gateway Timeout",
    description: "The server took too long to respond.",
  },
};

export function ErrorDisplay({
  errorCode = "500",
  title,
  description,
  message,
  onRetry,
  showRetry = true,
  showHome = true,
}: ErrorDisplayProps) {
  const router = useRouter();
  const defaults = errorDefaults[errorCode];
  const errorImagePath = `/Errors/${errorCode}.png`;

  const displayTitle = title || defaults.title;
  const displayDescription = description || defaults.description;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 p-4">
      {/* Error Image - Full Width */}
      <div className="w-full max-w-4xl mb-8">
        <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
          <Image
            src={errorImagePath}
            alt={`Error ${errorCode}`}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Error Details */}
      <div className="text-center mb-8 max-w-2xl px-4">
        <h1 className="text-6xl md:text-8xl font-bold text-gray-900 mb-4">
          {errorCode}
        </h1>
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
          {displayTitle}
        </h2>
        <p className="text-lg text-gray-600 mb-2">{displayDescription}</p>
        {message && (
          <p className="text-sm text-gray-500 mt-4 font-mono bg-gray-100 p-3 rounded-lg">
            {message}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        {showRetry && (
          <Button
            onClick={onRetry || (() => router.refresh())}
            size="lg"
            className="gap-2 min-w-[160px]"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </Button>
        )}
        {showHome && (
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            size="lg"
            className="gap-2 min-w-[160px]"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
}

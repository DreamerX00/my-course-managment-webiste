"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, RefreshCw } from "lucide-react";

export default function ErrorPage({
  error,
  reset,
}: {
  readonly error: Error & { digest?: string };
  readonly reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // TODO: Log the error to an error reporting service (e.g., Sentry)
    // Example: Sentry.captureException(error);
  }, [error]);

  // Determine error code from error message or default to 500
  const getErrorCode = () => {
    const message = error.message.toLowerCase();

    if (message.includes("400") || message.includes("bad request"))
      return "400";
    if (message.includes("401") || message.includes("unauthorized"))
      return "401";
    if (message.includes("403") || message.includes("forbidden")) return "403";
    if (message.includes("404") || message.includes("not found")) return "404";
    if (message.includes("405") || message.includes("method not allowed"))
      return "405";
    if (message.includes("408") || message.includes("timeout")) return "408";
    if (message.includes("409") || message.includes("conflict")) return "409";
    if (message.includes("429") || message.includes("too many requests"))
      return "429";
    if (message.includes("502") || message.includes("bad gateway"))
      return "502";
    if (message.includes("503") || message.includes("service unavailable"))
      return "503";
    if (message.includes("504") || message.includes("gateway timeout"))
      return "504";

    return "500"; // Default to 500 Internal Server Error
  };

  const errorCode = getErrorCode();
  const errorImagePath = `/Errors/${errorCode}.png`;

  const errorMessages: Record<string, { title: string; description: string }> =
    {
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
        description:
          "The request conflicts with the current state of the server.",
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

  const errorInfo = errorMessages[errorCode] || errorMessages["500"];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-linear-to-br from-gray-50 via-blue-50 to-purple-50 p-4">
      {/* Error Image - Full Width */}
      <div className="w-full max-w-4xl mb-8">
        <div className="relative w-full aspect-video md:aspect-[21/9]">
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
          {errorInfo.title}
        </h2>
        <p className="text-lg text-gray-600 mb-2">{errorInfo.description}</p>
        {error.message && (
          <p className="text-sm text-gray-500 mt-4 font-mono bg-gray-100 p-3 rounded-lg">
            {error.message}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 mt-4">
        <Button onClick={() => reset()} size="lg" className="gap-2 min-w-40">
          <RefreshCw className="w-5 h-5" />
          Try Again
        </Button>
        <Button
          onClick={() => router.push("/")}
          variant="outline"
          size="lg"
          className="gap-2 min-w-40"
        >
          <Home className="w-5 h-5" />
          Go Home
        </Button>
      </div>
    </div>
  );
}

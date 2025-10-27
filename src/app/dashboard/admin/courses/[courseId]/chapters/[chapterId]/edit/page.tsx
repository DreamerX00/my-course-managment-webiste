"use client";
import { useRouter } from "next/navigation";

export default function EditChapterPage() {
  const router = useRouter();
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Chapter</h1>
      <p className="text-gray-600">
        This page is under construction. Please use the content management page to edit chapters.
      </p>
      <button
        onClick={() => router.back()}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      >
        Go Back
      </button>
    </div>
  );
}
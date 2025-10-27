"use client";

import { Hero } from "@/components/Hero";
import { Features } from "@/components/Features";
import { Courses } from "@/components/Courses";
import { WhyChooseUs } from "@/components/WhyChooseUs";
import { Newsletter } from "@/components/Newsletter";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-linear-to-br from-blue-50 via-pink-50 to-yellow-50">
      <div className="flex flex-col flex-1 animate-fade-in">
        <Hero />
        <Features />
        <Courses />
        <WhyChooseUs />
        <Newsletter />
        <Footer />
      </div>
    </div>
  );
}

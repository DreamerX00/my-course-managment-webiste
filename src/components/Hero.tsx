"use client";

import { motion } from "framer-motion";
import { HERO_CONTENT } from "@/lib/constants";
import { useState } from "react";
import { Typewriter } from "@/components/ui/Typewriter";

const LEARNING_QUOTES = [
  "Learn Programming The Fun Way",
  "Learning never exhausts the mind.",
  "Education is the passport to the future.",
  "Knowledge is power.",
  "Curiosity is the wick in the candle of learning.",
  "Mistakes are proof you are trying.",
  "Every expert was once a beginner.",
  "Learning is a treasure that will follow its owner everywhere.",
  "The beautiful thing about learning is nobody can take it away from you.",
  "Success is the sum of small efforts, repeated day in and day out.",
  "Dream big, work hard, learn always.",
  "Never stop learning, because life never stops teaching.",
  "The more you learn, the more you earn.",
  "Learning is a journey, not a destination.",
  "Education is the most powerful weapon you can use to change the world.",
  "Learning is the eye of the mind.",
  "To teach is to learn twice.",
  "Learning is the key to unlock the golden door of freedom.",
  "A mind that is stretched by a new experience can never go back to its old dimensions.",
  "The capacity to learn is a gift; the ability to learn is a skill; the willingness to learn is a choice.",
  "Learning is not attained by chance, it must be sought for with ardor and attended to with diligence.",
  "The roots of education are bitter, but the fruit is sweet.",
  "Learning is the only thing the mind never exhausts, never fears, and never regrets.",
  "The expert in anything was once a beginner.",
  "Learning is a lifelong process.",
  "Education breeds confidence. Confidence breeds hope. Hope breeds peace.",
  "Learning is the stepping stone to wisdom.",
  "The best way to predict your future is to create it.",
  "Learning is the beginning of wealth.",
  "The mind is not a vessel to be filled, but a fire to be kindled.",
  "Learning is the bridge between confusion and clarity.",
  "Education is not preparation for life; education is life itself.",
  "Learning is the art of discovering what you already know.",
  "The more that you read, the more things you will know.",
  "Learning is the path to personal growth.",
  "Education is the key to success in life.",
  "Learning is the foundation of progress.",
  "The best learning happens when you least expect it.",
  "Learning is the adventure of a lifetime.",
  "Education opens doors you never knew existed.",
  "Learning is the engine of achievement.",
  "The journey of a thousand miles begins with a single step.",
  "Learning is the passport to endless possibilities.",
  "Education is the movement from darkness to light.",
  "Learning is the greatest adventure.",
  "The more you know, the more you realize you don't know.",
  "Learning is the key to unlocking your potential.",
  "Education is the foundation upon which we build our future.",
  "Learning is the secret to a happy life.",
  "The best investment you can make is in yourself.",
  "Learning is the antidote to ignorance.",
  "Education is the light in the darkness.",
  "Learning is the seed of innovation.",
  "The mind once enlightened cannot again become dark.",
  "Learning is the ladder to success.",
  "Education is the key to unlock the doors of opportunity.",
  "Learning is the compass that guides us.",
  "The more you learn, the more places you'll go.",
  "Education is the foundation of freedom.",
  "Learning is the spark that ignites change.",
  "The best way to learn is to do.",
  "Education is the anchor in the sea of life.",
  "Learning is the light that guides us through the darkness.",
  "Education is the key to a better tomorrow.",
  "Learning is the foundation of happiness.",
  "The more you learn, the more you grow.",
  "Education is the key to unlock the golden door of freedom.",
  "Learning is the foundation of creativity.",
  "Education is the key to unlock the treasures of the mind.",
  "Learning is the foundation of leadership.",
  "Education is the key to unlock the doors of opportunity.",
  "Learning is the foundation of innovation.",
  "Education is the key to unlock the doors of success.",
  "Learning is the foundation of greatness.",
  "Education is the key to unlock the doors of wisdom.",
  "Learning is the foundation of excellence.",
  "Education is the key to unlock the doors of knowledge.",
  "Learning is the foundation of achievement.",
  "Education is the key to unlock the doors of understanding.",
  "Learning is the foundation of fulfillment.",
  "Education is the key to unlock the doors of possibility.",
  "Learning is the foundation of joy.",
  "Education is the key to unlock the doors of discovery.",
  "Learning is the foundation of hope.",
  "Education is the key to unlock the doors of imagination.",
  "Learning is the foundation of courage.",
  "Education is the key to unlock the doors of adventure.",
  "Learning is the foundation of resilience.",
  "Education is the key to unlock the doors of dreams.",
  "Learning is the foundation of perseverance.",
  "Education is the key to unlock the doors of ambition.",
  "Learning is the foundation of determination.",
  "Education is the key to unlock the doors of potential.",
  "Learning is the foundation of self-discovery.",
  "Education is the key to unlock the doors of self-improvement.",
  "Learning is the foundation of self-empowerment.",
  "Education is the key to unlock the doors of self-actualization.",
  "Learning is the foundation of self-mastery.",
  "Education is the key to unlock the doors of self-expression.",
];

export function Hero() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      className="relative overflow-hidden bg-linear-to-br from-blue-200 via-pink-100 to-yellow-100 py-16 sm:py-24 lg:py-32 min-h-[calc(100vh-80px)] flex items-center"
    >
      {/* Animated Background with Mouse Response */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute inset-0 z-0 pointer-events-none transition-all duration-300"
        style={{
          background: `radial-gradient(circle at ${coords.x}px ${coords.y}px, rgba(59, 130, 246, 0.4) 0%, rgba(236, 72, 153, 0.3) 25%, rgba(251, 191, 36, 0.4) 50%, transparent 70%)`,
        }}
      >
        {/* Floating Animated Blobs */}
        <motion.div
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-60"
        />
        <motion.div
          animate={{
            x: [0, -25, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
          className="absolute top-1/2 right-1/4 w-48 h-48 sm:w-72 sm:h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-60"
        />
        <motion.div
          animate={{
            x: [0, 20, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 4,
          }}
          className="absolute bottom-1/4 left-1/3 w-48 h-48 sm:w-72 sm:h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-60"
        />
      </motion.div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        {/* Floating Mascot */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 0.3, type: "spring" }}
          className="mx-auto mb-2 flex justify-center"
        >
          <span className="text-5xl md:text-6xl drop-shadow-lg animate-bounce-slow">
            🦉
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-blue-900 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 drop-shadow-lg"
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.3 },
          }}
        >
          <motion.span
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            🎓
          </motion.span>
          <Typewriter
            texts={LEARNING_QUOTES}
            speed={40}
            pause={1600}
            className="leading-tight bg-linear-to-r from-blue-900 via-purple-800 to-pink-800 bg-clip-text text-transparent"
          />
          <motion.span
            whileHover={{ rotate: -10, scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="inline-block"
          >
            📚
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl leading-relaxed text-pink-700 max-w-3xl mx-auto font-bold px-4 drop-shadow-md"
          whileHover={{
            scale: 1.01,
            transition: { duration: 0.3 },
          }}
        >
          {HERO_CONTENT.subtitle.replace("🚀", "")}{" "}
          <span className="inline-block">🚀</span>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.7 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.a
            href="/courses"
            whileHover={{ scale: 1.08, boxShadow: "0 0 24px #fbbf24" }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-4 rounded-xl bg-linear-to-r from-yellow-400 to-pink-400 text-white font-bold text-lg shadow-lg hover:from-pink-400 hover:to-blue-400 transition-all duration-200 flex items-center gap-2 animate-glow"
          >
            <span>Browse Courses ✨</span>
          </motion.a>
          <motion.a
            href="/leaderboard"
            whileHover={{ scale: 1.08, boxShadow: "0 0 24px #60a5fa" }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-4 rounded-xl bg-white text-blue-800 font-bold text-lg shadow-lg border border-blue-200 hover:bg-blue-50 transition-all duration-200 flex items-center gap-2 animate-glow"
          >
            <span>View Leaderboard �</span>
          </motion.a>
        </motion.div>

        {/* Scroll Down Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.7 }}
          className="mt-12 sm:mt-16 flex flex-col items-center"
        >
          <span className="text-2xl text-blue-700 animate-bounce">↓</span>
          <span className="text-xs text-blue-700 mt-1">Scroll Down</span>
        </motion.div>

        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 0.9 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-8 sm:mt-12 text-lg sm:text-xl md:text-2xl font-bold text-blue-900 drop-shadow-lg px-4"
          whileHover={{
            scale: 1.02,
            transition: { duration: 0.3 },
          }}
        >
          <motion.span
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "linear",
            }}
            className="bg-linear-to-r from-blue-900 via-purple-800 to-pink-800 bg-clip-text text-transparent bg-size-[200%_200%]"
          >
            Empowering Education for Everyone!
          </motion.span>
          <span className="inline-block ml-2">🌟</span>
        </motion.div>
      </div>
    </section>
  );
}

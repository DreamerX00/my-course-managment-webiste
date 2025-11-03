"use client";

import { motion } from "framer-motion";
import { NEWSLETTER_CONTENT } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // TODO: Implement actual newsletter subscription API
      // For now, just simulate a successful subscription
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Successfully Subscribed! 🎉",
        description: "You'll receive our latest updates and course offerings.",
      });

      setEmail("");
    } catch {
      toast({
        title: "Subscription Failed",
        description: "Something went wrong. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative isolate overflow-hidden bg-linear-to-br from-cyan-500 to-blue-500 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center relative z-10">
        <motion.h2
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.8 }}
          className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl"
        >
          {NEWSLETTER_CONTENT.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mt-4 text-lg leading-8 text-white max-w-2xl mx-auto"
        >
          {NEWSLETTER_CONTENT.subtitle}
        </motion.p>
        <motion.form
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          onSubmit={handleSubmit}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-x-4 gap-y-4 max-w-lg mx-auto"
        >
          <Input
            type="email"
            placeholder={NEWSLETTER_CONTENT.placeholder}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            className="flex-grow min-w-0 bg-white/20 border-white text-white placeholder:text-white/70 focus:ring-2 focus:ring-white focus:border-white"
          />
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="bg-white text-blue-600 hover:bg-gray-100 transition-colors duration-300 shadow-lg disabled:opacity-50"
          >
            {loading ? "Subscribing..." : NEWSLETTER_CONTENT.buttonText}
          </Button>
        </motion.form>
      </div>
    </section>
  );
}

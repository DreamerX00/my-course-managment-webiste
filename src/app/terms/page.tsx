"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Scale,
  Users,
  BookOpen,
  Shield,
  AlertTriangle,
  CreditCard,
  Ban,
  FileCheck,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function TermsPage() {
  const lastUpdated = "November 3, 2025";

  const sections = [
    {
      icon: FileCheck,
      title: "Acceptance of Terms",
      content: [
        {
          subtitle: "Agreement to Terms",
          text: "By accessing and using our Course Management Platform, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.",
        },
        {
          subtitle: "Updates to Terms",
          text: "We reserve the right to modify these terms at any time. We will notify you of any changes via email or platform notification. Your continued use after changes constitutes acceptance of the new terms.",
        },
        {
          subtitle: "Eligibility",
          text: "You must be at least 13 years old to use our platform. Users under 18 must have parental consent. By using our services, you represent that you meet these requirements.",
        },
      ],
    },
    {
      icon: Users,
      title: "User Accounts",
      content: [
        {
          subtitle: "Account Creation",
          text: "You must provide accurate, current, and complete information during registration. You are responsible for maintaining the confidentiality of your account credentials.",
        },
        {
          subtitle: "Account Security",
          text: "You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized use or security breaches.",
        },
        {
          subtitle: "Account Termination",
          text: "We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or abuse our platform.",
        },
      ],
    },
    {
      icon: BookOpen,
      title: "Course Access & Usage",
      content: [
        {
          subtitle: "License Grant",
          text: "We grant you a limited, non-exclusive, non-transferable license to access and use the courses you've enrolled in for personal, non-commercial educational purposes.",
        },
        {
          subtitle: "Content Restrictions",
          text: "You may not download, copy, reproduce, distribute, transmit, broadcast, or create derivative works from our course content without explicit written permission.",
        },
        {
          subtitle: "Academic Integrity",
          text: "You agree to complete all coursework yourself and not share quiz answers, certificates, or assignments with others. Violations may result in account termination.",
        },
      ],
    },
    {
      icon: CreditCard,
      title: "Payments & Refunds",
      content: [
        {
          subtitle: "Pricing",
          text: "Course prices are displayed in your local currency and may be subject to change. Promotional pricing is subject to availability and specific terms.",
        },
        {
          subtitle: "Payment Processing",
          text: "Payments are processed securely through our third-party payment providers. You agree to provide accurate payment information and authorize charges.",
        },
        {
          subtitle: "Refund Policy",
          text: "Refunds may be available within 30 days of purchase if you've completed less than 25% of the course. Digital content purchases are typically non-refundable after download.",
        },
      ],
    },
    {
      icon: Shield,
      title: "Intellectual Property",
      content: [
        {
          subtitle: "Our Content",
          text: "All content, including courses, videos, text, graphics, logos, and software, is owned by us or our licensors and protected by copyright, trademark, and other intellectual property laws.",
        },
        {
          subtitle: "User Content",
          text: "You retain ownership of content you submit (e.g., forum posts, projects). By submitting content, you grant us a worldwide, non-exclusive license to use, display, and distribute it.",
        },
        {
          subtitle: "Prohibited Use",
          text: "You may not use our trademarks, logos, or branding without written permission. Scraping, data mining, or automated collection of our content is strictly prohibited.",
        },
      ],
    },
    {
      icon: Ban,
      title: "Prohibited Conduct",
      content: [
        {
          subtitle: "Community Guidelines",
          text: "You agree not to post offensive, harmful, or inappropriate content. Harassment, hate speech, and discriminatory behavior are not tolerated.",
        },
        {
          subtitle: "Technical Abuse",
          text: "You may not attempt to hack, interfere with, or disrupt our platform. Using bots, scrapers, or automated systems without permission is prohibited.",
        },
        {
          subtitle: "Commercial Use",
          text: "You may not use our platform for unauthorized commercial purposes, including reselling access, offering competing services, or unauthorized advertising.",
        },
      ],
    },
    {
      icon: AlertTriangle,
      title: "Disclaimers & Limitations",
      content: [
        {
          subtitle: "Service Availability",
          text: "We strive for 99.9% uptime but cannot guarantee uninterrupted service. We reserve the right to modify, suspend, or discontinue services with or without notice.",
        },
        {
          subtitle: "Educational Outcomes",
          text: "While we provide high-quality educational content, we do not guarantee specific learning outcomes, job placement, or career advancement.",
        },
        {
          subtitle: "Limitation of Liability",
          text: "To the maximum extent permitted by law, we are not liable for indirect, incidental, or consequential damages arising from your use of our platform.",
        },
      ],
    },
    {
      icon: Scale,
      title: "Dispute Resolution",
      content: [
        {
          subtitle: "Governing Law",
          text: "These terms are governed by the laws of [Your Jurisdiction]. Any disputes will be resolved in the courts of [Your Jurisdiction].",
        },
        {
          subtitle: "Arbitration",
          text: "For disputes under $10,000, you agree to resolve the matter through binding arbitration rather than court proceedings, unless prohibited by law.",
        },
        {
          subtitle: "Class Action Waiver",
          text: "You agree to resolve disputes individually and waive the right to participate in class actions or representative proceedings.",
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-red-950/20" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-red-600 mb-6"
          >
            <Scale className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 bg-clip-text text-transparent mb-6"
          >
            Terms of Service
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground mb-4"
          >
            Please read these terms carefully before using our platform.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm text-muted-foreground"
          >
            Last Updated:{" "}
            <span className="font-semibold text-foreground">{lastUpdated}</span>
          </motion.p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 border-amber-100 dark:border-amber-900 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardContent className="p-8">
                <p className="text-lg text-foreground leading-relaxed">
                  These Terms of Service (&quot;Terms&quot;) govern your access
                  to and use of the{" "}
                  <span className="font-semibold">
                    Course Management Platform
                  </span>{" "}
                  and its services. By using our platform, you agree to comply
                  with these terms and all applicable laws and regulations.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Terms Sections */}
          {sections.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center">
                      <section.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-foreground mb-2">
                        {section.title}
                      </h2>
                    </div>
                  </div>

                  <div className="space-y-6 ml-16">
                    {section.content.map((item, idx) => (
                      <div key={idx}>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                          {item.subtitle}
                        </h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          {/* Contact Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-2 border-red-100 dark:border-red-900 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                    <FileCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                      Questions About These Terms?
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      If you have any questions or concerns about these Terms of
                      Service, please contact our legal team.
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="text-foreground">
                        <span className="font-semibold">Email:</span>{" "}
                        legal@courseplatform.com
                      </p>
                      <p className="text-foreground">
                        <span className="font-semibold">Response Time:</span>{" "}
                        Within 5 business days
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center pt-8"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-amber-600 hover:text-red-600 transition-colors font-semibold group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">
                ←
              </span>
              Back to Home
            </Link>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

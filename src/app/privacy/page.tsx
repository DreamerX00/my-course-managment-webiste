"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Shield,
  Lock,
  Eye,
  Database,
  Mail,
  UserCheck,
  AlertCircle,
  FileText,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function PrivacyPolicyPage() {
  const lastUpdated = "November 3, 2025";

  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: [
        {
          subtitle: "Personal Information",
          text: "When you create an account, we collect your name, email address, and profile information. This helps us provide you with a personalized learning experience.",
        },
        {
          subtitle: "Usage Data",
          text: "We automatically collect information about how you interact with our platform, including course progress, quiz results, and learning patterns to improve your experience.",
        },
        {
          subtitle: "Technical Data",
          text: "We collect device information, IP addresses, browser types, and operating system data to ensure our platform works smoothly across all devices.",
        },
      ],
    },
    {
      icon: Database,
      title: "How We Use Your Information",
      content: [
        {
          subtitle: "Service Delivery",
          text: "We use your data to provide, maintain, and improve our educational services, including personalized course recommendations and progress tracking.",
        },
        {
          subtitle: "Communication",
          text: "We may send you important updates about your courses, account security, and new features. You can opt-out of promotional emails at any time.",
        },
        {
          subtitle: "Analytics & Improvement",
          text: "Your usage data helps us understand how to make our platform better, identify issues, and develop new features that serve you better.",
        },
      ],
    },
    {
      icon: Lock,
      title: "Data Security",
      content: [
        {
          subtitle: "Encryption",
          text: "All data transmitted between your device and our servers is encrypted using industry-standard SSL/TLS protocols to protect your information.",
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict access controls to ensure only authorized personnel can access user data, and only when necessary for service delivery.",
        },
        {
          subtitle: "Regular Audits",
          text: "Our security practices are regularly reviewed and updated to protect against emerging threats and vulnerabilities.",
        },
      ],
    },
    {
      icon: UserCheck,
      title: "Your Rights",
      content: [
        {
          subtitle: "Access & Download",
          text: "You have the right to access and download all your personal data at any time through your account settings.",
        },
        {
          subtitle: "Correction & Deletion",
          text: "You can update or delete your personal information. Contact us if you need assistance with data deletion requests.",
        },
        {
          subtitle: "Opt-Out Options",
          text: "You can opt-out of marketing communications and control your privacy settings through your account preferences.",
        },
      ],
    },
    {
      icon: FileText,
      title: "Data Sharing & Third Parties",
      content: [
        {
          subtitle: "Service Providers",
          text: "We work with trusted service providers for hosting, analytics, and payment processing. These partners are contractually bound to protect your data.",
        },
        {
          subtitle: "No Data Sales",
          text: "We never sell your personal information to third parties. Your privacy is not for sale.",
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information when required by law, such as in response to valid legal requests or to protect our rights and users' safety.",
        },
      ],
    },
    {
      icon: AlertCircle,
      title: "Cookies & Tracking",
      content: [
        {
          subtitle: "Essential Cookies",
          text: "We use cookies necessary for authentication, security, and basic functionality of the platform.",
        },
        {
          subtitle: "Analytics Cookies",
          text: "With your consent, we use analytics cookies to understand how users interact with our platform and improve user experience.",
        },
        {
          subtitle: "Cookie Control",
          text: "You can manage cookie preferences through your browser settings. Note that disabling certain cookies may affect platform functionality.",
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background">
      {/* Hero Section */}
      <section className="relative pt-32 pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />

        <div className="relative max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-6"
          >
            <Shield className="w-10 h-10 text-white" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6"
          >
            Privacy Policy
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg text-muted-foreground mb-4"
          >
            Your privacy matters to us. Learn how we collect, use, and protect
            your information.
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
            <Card className="border-2 border-blue-100 dark:border-blue-900 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
              <CardContent className="p-8">
                <p className="text-lg text-foreground leading-relaxed">
                  Welcome to our Privacy Policy. At{" "}
                  <span className="font-semibold">
                    Course Management Platform
                  </span>
                  , we are committed to protecting your personal information and
                  your right to privacy. This policy explains what information
                  we collect, how we use it, and what rights you have in
                  relation to it.
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Policy Sections */}
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
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
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
            <Card className="border-2 border-purple-100 dark:border-purple-900 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-3">
                      Questions or Concerns?
                    </h2>
                    <p className="text-muted-foreground mb-4">
                      If you have any questions about this Privacy Policy or our
                      data practices, please don&apos;t hesitate to contact us.
                    </p>
                    <div className="space-y-2 text-sm">
                      <p className="text-foreground">
                        <span className="font-semibold">Email:</span>{" "}
                        privacy@courseplatform.com
                      </p>
                      <p className="text-foreground">
                        <span className="font-semibold">Response Time:</span>{" "}
                        Within 48 hours
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
              className="inline-flex items-center gap-2 text-blue-600 hover:text-purple-600 transition-colors font-semibold group"
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

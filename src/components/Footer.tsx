"use client";

import Link from "next/link";
import Image from "next/image";
import {
  FOOTER_LINKS,
  COPYRIGHT_TEXT,
  NEWSLETTER_CONTENT,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Image
                src="/logo.svg"
                alt="Dreamer Academy Logo"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <h3 className="text-xl font-bold text-white">Dreamer Academy</h3>
            </div>
            <p className="text-gray-400">
              Your journey to mastery in programming and tech starts here.
            </p>
            <div className="flex space-x-4 mt-4">
              {FOOTER_LINKS.socials.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                >
                  <social.icon className="h-6 w-6" />
                </Link>
              ))}
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Company</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.about.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Resources</h3>
            <ul className="space-y-2">
              {FOOTER_LINKS.resources.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Form */}
          <div className="space-y-4 lg:col-span-1 md:col-span-3">
            <h3 className="text-lg font-semibold text-white">Newsletter</h3>
            <p className="text-gray-400">{NEWSLETTER_CONTENT.subtitle}</p>
            <form className="flex flex-col sm:flex-row gap-2 mt-4">
              <Input
                type="email"
                placeholder={NEWSLETTER_CONTENT.placeholder}
                className="grow bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {NEWSLETTER_CONTENT.buttonText}
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>{COPYRIGHT_TEXT}</p>
        </div>
      </div>
    </footer>
  );
}

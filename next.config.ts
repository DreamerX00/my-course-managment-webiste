import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ESLint enabled for build - all warnings must be fixed
    ignoreDuringBuilds: false,
  },
  typescript: {
    // TypeScript checking enabled for build
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;

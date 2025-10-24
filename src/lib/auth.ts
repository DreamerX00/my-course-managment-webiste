import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import type { UserRole } from "@prisma/client"
// import { PrismaAdapter } from "@auth/prisma-adapter"
// import { db } from "./db"

export const authOptions: NextAuthOptions = {
  // adapter: PrismaAdapter(db),
  secret: process.env.NEXTAUTH_SECRET || "super-secret-development-key", // Temporary secret
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // This is a temporary mock for authorization without a database
        if (credentials?.email === "test@example.com" && credentials?.password === "password") {
          return {
            id: "mock_user_id",
            name: "Mock User",
            email: "test@example.com",
            role: "STUDENT", // Or 'INSTRUCTOR'
            image: "",
          };
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user && 'role' in user) {
        token.id = user.id;
        token.role = user.role as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
}; 
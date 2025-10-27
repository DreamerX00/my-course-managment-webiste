import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { db } from "@/lib/db";
import { Adapter } from "next-auth/adapters";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.email = user.email || "";
        token.name = user.name || "";
        token.picture = user.image || "";

        // Fetch user role from database
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });
        token.role = dbUser?.role || "STUDENT";
      }

      // Update session (e.g., when user updates profile)
      if (trigger === "update") {
        const dbUser = await db.user.findUnique({
          where: { id: token.id as string },
          select: { role: true, name: true, image: true },
        });
        if (dbUser) {
          token.role = dbUser.role;
          token.name = dbUser.name || "";
          token.picture = dbUser.image || "";
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = (token.email as string) || "";
        session.user.name = (token.name as string) || "";
        session.user.image = (token.picture as string) || "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        session.user.role = token.role as any;
      }
      return session;
    },
    async signIn({ user, account }) {
      // Only run for OAuth sign-ins
      if (account?.provider === "google") {
        try {
          // Check if user exists
          const existingUser = await db.user.findUnique({
            where: { email: user.email! },
          });

          // If user exists but doesn't have a role, update it
          if (existingUser && !existingUser.role) {
            await db.user.update({
              where: { id: existingUser.id },
              data: { role: "STUDENT" },
            });
          }
        } catch (error) {
          console.error("Error in signIn callback:", error);
        }
      }

      return true;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: false,
};

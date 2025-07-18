import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import { firebaseAdminAuth } from "@/lib/firebaseAdmin";
import { NextAuthOptions } from "next-auth";
import debug from "debug";

const prisma = new PrismaClient();
const nextAuthDebug = debug("nextauth:debug");
nextAuthDebug("=== NextAuth route loaded ===");
console.log("=== NextAuth route loaded ===");

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "firebase",
      name: "Firebase",
      credentials: {
        idToken: { label: "Firebase ID Token", type: "text" },
      },
      async authorize(credentials) {
        nextAuthDebug('[AUTHORIZE] credentials:', credentials);
        console.log('[AUTHORIZE] credentials:', credentials);
        if (!credentials?.idToken) {
          nextAuthDebug('[AUTHORIZE] No idToken provided');
          console.log('[AUTHORIZE] No idToken provided');
          return null;
        }
        try {
          const decoded = await firebaseAdminAuth.verifyIdToken(credentials.idToken);
          nextAuthDebug('[AUTHORIZE] decoded:', decoded);
          console.log('[AUTHORIZE] decoded:', decoded);
          let user = await prisma.user.findUnique({ where: { email: decoded.email } });
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: decoded.email,
                name: decoded.name,
                image: decoded.picture,
                role: "STUDENT",
              },
            });
          }
          nextAuthDebug('[AUTHORIZE] returning user:', user);
          console.log('[AUTHORIZE] returning user:', user);
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          };
        } catch (e) {
          nextAuthDebug('[AUTHORIZE] Firebase login error:', e);
          console.log('[AUTHORIZE] Firebase login error:', e);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      nextAuthDebug('[JWT CALLBACK] token:', token, 'user:', user);
      if (user) {
        token.id = (user as any).id;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      nextAuthDebug('[SESSION CALLBACK] session:', session, 'token:', token);
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "super-secret-development-key",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 
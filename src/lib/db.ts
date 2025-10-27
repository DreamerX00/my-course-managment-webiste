import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

declare global {
  var prisma: ReturnType<typeof createPrismaClient> | undefined;
}

function createPrismaClient() {
  const client = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

  // Use Accelerate URL if available, otherwise use direct connection
  if (process.env.DATABASE_URL?.includes("prisma.sh")) {
    // Already using Accelerate connection string
    return client.$extends(withAccelerate());
  }

  // Using direct Neon connection - Accelerate provides additional benefits even without Accelerate URL
  return client.$extends(withAccelerate());
}

export const db = globalThis.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
] as const;

export function validateEnv() {
  if (typeof window !== 'undefined') {
    // Skip validation on client side
    return;
  }

  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(
      `⚠️  Warning: Missing environment variables:\n` +
      missing.map(key => `  - ${key}`).join('\n') +
      `\n\nSome features may not work correctly. See .env.example for reference.`
    );
  }

  // Validate NEXTAUTH_SECRET length (should be at least 32 characters)
  const secret = process.env.NEXTAUTH_SECRET;
  if (secret && secret.length < 32) {
    console.warn(
      '⚠️  Warning: NEXTAUTH_SECRET should be at least 32 characters long for security.\n' +
      '   Generate a strong secret with: openssl rand -base64 32'
    );
  }
}

// Auto-validate on import (server-side only)
validateEnv();

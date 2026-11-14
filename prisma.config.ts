import { defineConfig } from "prisma/config";

// Prisma 7 does not load env files itself. Load .env.local when present (local dev).
// On Vercel/CI the file does not exist and env vars come from the platform.
try {
  process.loadEnvFile(".env.local");
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  // CLI (migrate, introspect) uses the session pooler / direct connection on port 5432.
  // `?? ""` instead of env() so `prisma generate` works on CI without DB access.
  datasource: {
    url: process.env.DIRECT_URL ?? "",
  },
});

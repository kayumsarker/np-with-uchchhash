import "server-only";
import { Prisma } from "@/generated/prisma/client";

/** Unique constraint failed (e.g. duplicate slug). */
export function isUniqueViolation(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
}

/** Record to update/delete does not exist. */
export function isNotFound(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025";
}

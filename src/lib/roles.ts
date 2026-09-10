/**
 * src/lib/roles.ts
 * Shared constants & helpers for role checking.
 * Safe to import in both client and server components.
 */

export const ADMIN_EMAILS = [
  "syauqiazhardanii@gmail.com",
  "krisnoadiputra@gmail.com",
  "linirose6@gmail.com",
];

export type UserRole = "free" | "member" | "admin";

export function isUserAdmin(email?: string | null, role?: string | null): boolean {
  if (role === "admin") return true;
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

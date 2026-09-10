import NextAuth, { DefaultSession, DefaultJWT } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "free" | "member" | "admin";
      tier: string;
      onboarding_completed: boolean;
    } & DefaultSession["user"];
  }

  interface JWT {
    role?: "free" | "member" | "admin";
    tier?: string;
    onboarding_completed?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "free" | "member" | "admin";
    tier?: string;
    onboarding_completed?: boolean;
  }
}

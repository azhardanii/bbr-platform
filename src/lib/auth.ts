import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./db";
import { ADMIN_EMAILS, isUserAdmin } from "./roles";

export { ADMIN_EMAILS };

/** @deprecated use ADMIN_EMAILS */
export const VIP_EMAILS = ADMIN_EMAILS;

const googleClientId = (
  process.env.AUTH_GOOGLE_ID ||
  process.env.GOOGLE_CLIENT_ID ||
  process.env.GOOGLE_ID ||
  ""
).trim().replace(/^["']|["']$/g, "");

const googleClientSecret = (
  process.env.AUTH_GOOGLE_SECRET ||
  process.env.GOOGLE_CLIENT_SECRET ||
  process.env.GOOGLE_SECRET ||
  ""
).trim().replace(/^["']|["']$/g, "");

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  secret: (process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "bbr-platform-super-secret-key-123").trim().replace(/^["']|["']$/g, ""),
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      const normalizedEmail = user.email.toLowerCase().trim();
      const isAdmin = isUserAdmin(normalizedEmail);
      const role = isAdmin ? "admin" : "free";
      const targetTier = isAdmin ? "summit" : "spark";

      try {
        const existingUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });

        if (!existingUser) {
          await prisma.user.create({
            data: {
              email: normalizedEmail,
              nama_lengkap: user.name || "Mahasiswa",
              google_id: account?.providerAccountId,
              tier: targetTier,
              role,
              onboarding_completed: false,
            },
          });
        } else {
          // If user was created by Lynk.id payment webhook before logging in, link google_id
          const updates: any = {};
          if (!existingUser.google_id && account?.providerAccountId) {
            updates.google_id = account.providerAccountId;
          }
          if ((!existingUser.nama_lengkap || existingUser.nama_lengkap === "Mahasiswa") && user.name) {
            updates.nama_lengkap = user.name;
          }
          // Ensure admin users always have correct role + tier in DB
          if (isAdmin && (existingUser.role !== "admin" || existingUser.tier !== "summit")) {
            updates.role = "admin";
            updates.tier = "summit";
          }
          if (Object.keys(updates).length > 0) {
            await prisma.user.update({
              where: { email: normalizedEmail },
              data: updates,
            });
          }
        }
      } catch (dbError) {
        console.error("[Auth] Database error in signIn callback:", dbError);
        // Still allow signing in even if DB is temporarily waking up
      }

      return true;
    },

    async jwt({ token, user, trigger, session }) {
      const email = (user?.email || token.email)?.toLowerCase().trim();
      const isAdmin = isUserAdmin(email, token.role as string);

      if (user) {
        token.email = email;
        token.tier = isAdmin ? "summit" : "spark";
        token.role = isAdmin ? "admin" : "free";
      }

      // If user session was updated (e.g. after onboarding)
      if (trigger === "update" && session) {
        if (session.onboarding_completed !== undefined) {
          token.onboarding_completed = session.onboarding_completed;
        }
        if (session.tier) token.tier = session.tier;
        if (session.name) token.name = session.name;
        if (session.role) token.role = session.role;
      }

      // Sync latest user data from DB
      if (email) {
        token.email = email;
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email },
          });
          if (dbUser) {
            token.sub = dbUser.id;
            token.tier = isAdmin ? "summit" : dbUser.tier;
            token.role = isAdmin ? "admin" : (dbUser.role || "free");
            token.onboarding_completed = dbUser.onboarding_completed ?? false;
            token.name = dbUser.nama_lengkap || token.name;
          }
        } catch {
          // Graceful fallback
        }
      }

      // Unconditional admin guarantee
      if (isAdmin) {
        token.role = "admin";
        token.tier = "summit";
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        if (token.sub) {
          session.user.id = token.sub;
        }
        const email = session.user.email?.toLowerCase().trim() || (token.email as string)?.toLowerCase().trim();
        const isAdmin = isUserAdmin(email, token.role as string);

        (session.user as any).tier = isAdmin ? "summit" : (token.tier || "spark");
        (session.user as any).role = isAdmin ? "admin" : (token.role || "free");
        (session.user as any).onboarding_completed = token.onboarding_completed ?? false;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});

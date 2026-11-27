import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Lightweight config used ONLY in middleware — no Prisma, no DB calls.
// The full config with Prisma lives in lib/auth.ts.
export const authConfig: NextAuthConfig = {
  providers: [Credentials({})],
  pages: {
    signIn: "/astelfin_26/login",
  },
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
    // Expose only the per-system access claims to middleware. These are
    // coarse route guards; every HP-Hub server action re-checks the member's
    // role against the database (lib/hp-hub/auth.ts).
    session({ session, token }) {
      if (session.user) {
        session.user.astelfinAccess = token.astelfinAccess !== false;
        session.user.hpRole = (token.hpRole as string | null | undefined) ?? null;
      }
      return session;
    },
  },
};

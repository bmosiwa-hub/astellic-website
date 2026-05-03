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
  },
};

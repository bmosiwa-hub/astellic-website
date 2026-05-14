import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "@/auth.config";

// ── Constants ─────────────────────────────────────────────────────────────────

const MAX_ATTEMPTS    = 5;           // lock after this many consecutive failures
const LOCK_MINUTES    = 30;          // how long to lock the account
const LOCK_MS         = LOCK_MINUTES * 60 * 1000;

// ── Schema ────────────────────────────────────────────────────────────────────

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
});

// ── Helpers ───────────────────────────────────────────────────────────────────

async function recordLoginEvent(opts: {
  email:         string;
  userId?:       string;
  success:       boolean;
  ipAddress:     string;
  userAgent:     string;
  failureReason?: string;
}) {
  try {
    await prisma.loginEvent.create({
      data: {
        email:         opts.email,
        userId:        opts.userId,
        success:       opts.success,
        ipAddress:     opts.ipAddress,
        userAgent:     opts.userAgent,
        failureReason: opts.failureReason,
      },
    });
  } catch {
    // Never let audit failures block authentication
    console.error("[auth] Failed to write LoginEvent");
  }
}

async function getOrCreateAttemptRecord(email: string) {
  return prisma.loginAttempt.upsert({
    where:  { email },
    update: {},
    create: { email, attempts: 0 },
  });
}

async function incrementFailure(email: string, currentAttempts: number) {
  const newCount   = currentAttempts + 1;
  const shouldLock = newCount >= MAX_ATTEMPTS;
  await prisma.loginAttempt.update({
    where: { email },
    data: {
      attempts:      newCount,
      lastAttemptAt: new Date(),
      lockedUntil:   shouldLock ? new Date(Date.now() + LOCK_MS) : undefined,
    },
  });
  return { locked: shouldLock, attemptsLeft: Math.max(0, MAX_ATTEMPTS - newCount) };
}

async function resetAttempts(email: string, userId: string) {
  await Promise.all([
    prisma.loginAttempt.update({
      where: { email },
      data:  { attempts: 0, lockedUntil: null, lastAttemptAt: new Date() },
    }).catch(() => {}),
    prisma.user.update({
      where: { id: userId },
      data:  {
        failedLoginCount: 0,
        lastLoginAt:      new Date(),
        lockedUntil:      null,
      },
    }).catch(() => {}),
  ]);
}

// ── Exported lockout-check helper (used by login page to surface details) ─────

export async function checkLoginLockout(email: string): Promise<{
  locked:       boolean;
  lockedUntil?: Date;
  attemptsLeft: number;
}> {
  const rec = await prisma.loginAttempt.findUnique({ where: { email } });
  if (!rec) return { locked: false, attemptsLeft: MAX_ATTEMPTS };

  if (rec.lockedUntil && rec.lockedUntil > new Date()) {
    return { locked: true, lockedUntil: rec.lockedUntil, attemptsLeft: 0 };
  }

  // Lock has expired — reset silently
  if (rec.lockedUntil && rec.lockedUntil <= new Date()) {
    await prisma.loginAttempt.update({
      where: { email },
      data:  { attempts: 0, lockedUntil: null },
    }).catch(() => {});
    return { locked: false, attemptsLeft: MAX_ATTEMPTS };
  }

  return {
    locked:       false,
    attemptsLeft: Math.max(0, MAX_ATTEMPTS - rec.attempts),
  };
}

// ── NextAuth config ───────────────────────────────────────────────────────────

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email:     { label: "Email",     type: "email"    },
        password:  { label: "Password",  type: "password" },
        ipAddress: { label: "IP",        type: "text"     },
        userAgent: { label: "UserAgent", type: "text"     },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const ipAddress = (credentials?.ipAddress as string) || "unknown";
        const userAgent = (credentials?.userAgent as string) || "unknown";

        // ── 1. Lockout check ────────────────────────────────────────────────
        const attemptRec = await getOrCreateAttemptRecord(email);
        if (attemptRec.lockedUntil && attemptRec.lockedUntil > new Date()) {
          await recordLoginEvent({
            email, success: false, ipAddress, userAgent,
            failureReason: "ACCOUNT_LOCKED",
          });
          return null;
        }

        // ── 2. Find user ─────────────────────────────────────────────────────
        const user = await prisma.user.findUnique({
          where:  { email },
          select: {
            id: true, name: true, email: true, passwordHash: true, role: true,
            active: true, lockedUntil: true, mustChangePassword: true,
            totpEnabled: true,
          },
        });

        if (!user) {
          await incrementFailure(email, attemptRec.attempts);
          await recordLoginEvent({
            email, success: false, ipAddress, userAgent,
            failureReason: "USER_NOT_FOUND",
          });
          return null;
        }

        if (!user.active) {
          await recordLoginEvent({
            email, userId: user.id, success: false, ipAddress, userAgent,
            failureReason: "ACCOUNT_INACTIVE",
          });
          return null;
        }

        // Also check User-level lock (in case admin locked via the settings page)
        if (user.lockedUntil && user.lockedUntil > new Date()) {
          await recordLoginEvent({
            email, userId: user.id, success: false, ipAddress, userAgent,
            failureReason: "ACCOUNT_LOCKED",
          });
          return null;
        }

        // ── 3. Password check ────────────────────────────────────────────────
        const valid = await bcrypt.compare(password, user.passwordHash);

        if (!valid) {
          const { locked, attemptsLeft } = await incrementFailure(email, attemptRec.attempts);
          await recordLoginEvent({
            email, userId: user.id, success: false, ipAddress, userAgent,
            failureReason: locked
              ? `ACCOUNT_LOCKED_AFTER_${MAX_ATTEMPTS}_ATTEMPTS`
              : `INVALID_PASSWORD (${attemptsLeft} attempts left)`,
          });
          return null;
        }

        // ── 4. Success — reset counters ──────────────────────────────────────
        await resetAttempts(email, user.id);
        await recordLoginEvent({
          email, userId: user.id, success: true, ipAddress, userAgent,
        });

        return {
          id:                 user.id,
          name:               user.name,
          email:              user.email,
          role:               user.role,
          mustChangePassword: user.mustChangePassword,
          totpEnabled:        user.totpEnabled,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge:   8 * 60 * 60, // 8 hours — hard server-side expiry
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id                = user.id;
        token.role              = (user as { role: string }).role;
        token.mustChangePassword = (user as { mustChangePassword?: boolean }).mustChangePassword ?? false;
        token.totpEnabled       = (user as { totpEnabled?: boolean }).totpEnabled ?? false;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id                = token.id   as string;
        session.user.role              = token.role as string;
        session.user.mustChangePassword = token.mustChangePassword as boolean | undefined;
        session.user.totpEnabled        = token.totpEnabled as boolean | undefined;
      }
      return session;
    },
  },
});

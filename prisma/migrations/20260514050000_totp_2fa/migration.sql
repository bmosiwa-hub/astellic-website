-- Phase 9: TOTP 2FA columns on User
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "totpSecret"  TEXT,
  ADD COLUMN IF NOT EXISTS "totpEnabled" BOOLEAN NOT NULL DEFAULT false;

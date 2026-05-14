-- ─────────────────────────────────────────────────────────────────────────────
-- Phase 1 — Audit Foundation
-- ─────────────────────────────────────────────────────────────────────────────

-- ── User: login security fields ───────────────────────────────────────────────
ALTER TABLE "User"
  ADD COLUMN "failedLoginCount"  INTEGER   NOT NULL DEFAULT 0,
  ADD COLUMN "lockedUntil"       TIMESTAMP,
  ADD COLUMN "lastLoginAt"       TIMESTAMP,
  ADD COLUMN "passwordChangedAt" TIMESTAMP;

-- ── Soft-delete fields ────────────────────────────────────────────────────────
ALTER TABLE "Income"
  ADD COLUMN "deletedAt"      TIMESTAMP,
  ADD COLUMN "deletedBy"      TEXT,
  ADD COLUMN "deletionReason" TEXT;

ALTER TABLE "Expense"
  ADD COLUMN "deletedAt"      TIMESTAMP,
  ADD COLUMN "deletedBy"      TEXT,
  ADD COLUMN "deletionReason" TEXT;

ALTER TABLE "Payroll"
  ADD COLUMN "deletedAt"      TIMESTAMP,
  ADD COLUMN "deletedBy"      TEXT,
  ADD COLUMN "deletionReason" TEXT,
  ADD COLUMN "lockedAt"       TIMESTAMP,
  ADD COLUMN "lockedBy"       TEXT;

ALTER TABLE "Consultant"
  ADD COLUMN "deletedAt"      TIMESTAMP,
  ADD COLUMN "deletedBy"      TEXT,
  ADD COLUMN "deletionReason" TEXT;

ALTER TABLE "ConsultantPayment"
  ADD COLUMN "deletedAt"      TIMESTAMP,
  ADD COLUMN "deletedBy"      TEXT,
  ADD COLUMN "deletionReason" TEXT;

ALTER TABLE "Debt"
  ADD COLUMN "deletedAt"      TIMESTAMP,
  ADD COLUMN "deletedBy"      TEXT,
  ADD COLUMN "deletionReason" TEXT;

ALTER TABLE "DebtRepayment"
  ADD COLUMN "deletedAt"      TIMESTAMP,
  ADD COLUMN "deletedBy"      TEXT,
  ADD COLUMN "deletionReason" TEXT;

ALTER TABLE "TaxRemittance"
  ADD COLUMN "deletedAt"      TIMESTAMP,
  ADD COLUMN "deletedBy"      TEXT,
  ADD COLUMN "deletionReason" TEXT;

ALTER TABLE "Submission"
  ADD COLUMN "deletedAt"      TIMESTAMP,
  ADD COLUMN "deletedBy"      TEXT,
  ADD COLUMN "deletionReason" TEXT;

ALTER TABLE "Liquidation"
  ADD COLUMN "deletedAt"      TIMESTAMP,
  ADD COLUMN "deletedBy"      TEXT,
  ADD COLUMN "deletionReason" TEXT;

ALTER TABLE "AccountPayable"
  ADD COLUMN "deletedAt"      TIMESTAMP,
  ADD COLUMN "deletedBy"      TEXT,
  ADD COLUMN "deletionReason" TEXT;

ALTER TABLE "AccountReceivable"
  ADD COLUMN "deletedAt"      TIMESTAMP,
  ADD COLUMN "deletedBy"      TEXT,
  ADD COLUMN "deletionReason" TEXT;

ALTER TABLE "Procurement"
  ADD COLUMN "deletedAt"      TIMESTAMP,
  ADD COLUMN "deletedBy"      TEXT,
  ADD COLUMN "deletionReason" TEXT;

ALTER TABLE "Asset"
  ADD COLUMN "deletedAt"      TIMESTAMP,
  ADD COLUMN "deletedBy"      TEXT,
  ADD COLUMN "deletionReason" TEXT;

-- ── AuditEvent — immutable, tamper-evident event log ─────────────────────────
CREATE TABLE "AuditEvent" (
  "id"            TEXT        NOT NULL,
  "createdAt"     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId"        TEXT,
  "userEmail"     TEXT        NOT NULL DEFAULT '',
  "userName"      TEXT        NOT NULL DEFAULT '',
  "userRole"      TEXT        NOT NULL DEFAULT '',
  "ipAddress"     TEXT        NOT NULL DEFAULT 'unknown',
  "userAgent"     TEXT        NOT NULL DEFAULT 'unknown',
  "sessionId"     TEXT,
  "action"        TEXT        NOT NULL,
  "entityType"    TEXT        NOT NULL,
  "entityId"      TEXT,
  "previousValue" JSONB,
  "newValue"      JSONB,
  "changedFields" TEXT[]      NOT NULL DEFAULT '{}',
  "detail"        TEXT,
  "checksum"      TEXT        NOT NULL DEFAULT '',
  CONSTRAINT "AuditEvent_pkey" PRIMARY KEY ("id")
);

-- Index for fast lookups by entity (auditor queries "all events for record X")
CREATE INDEX "AuditEvent_entityType_entityId_idx" ON "AuditEvent"("entityType", "entityId");
-- Index for fast lookups by user (auditor queries "all actions by user Y")
CREATE INDEX "AuditEvent_userId_idx" ON "AuditEvent"("userId");
-- Index for time-range queries
CREATE INDEX "AuditEvent_createdAt_idx" ON "AuditEvent"("createdAt");

-- ── ApprovalRecord — immutable approval chain ─────────────────────────────────
CREATE TABLE "ApprovalRecord" (
  "id"             TEXT        NOT NULL,
  "createdAt"      TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "entityType"     TEXT        NOT NULL,
  "entityId"       TEXT        NOT NULL,
  "decidedById"    TEXT        NOT NULL,
  "decidedByEmail" TEXT        NOT NULL,
  "decidedByName"  TEXT        NOT NULL,
  "decidedByRole"  TEXT        NOT NULL,
  "previousStatus" TEXT        NOT NULL,
  "newStatus"      TEXT        NOT NULL,
  "decision"       TEXT        NOT NULL,
  "comments"       TEXT,
  "ipAddress"      TEXT        NOT NULL DEFAULT 'unknown',
  "checksum"       TEXT        NOT NULL DEFAULT '',
  CONSTRAINT "ApprovalRecord_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ApprovalRecord_entityType_entityId_idx" ON "ApprovalRecord"("entityType", "entityId");
CREATE INDEX "ApprovalRecord_decidedById_idx"          ON "ApprovalRecord"("decidedById");
CREATE INDEX "ApprovalRecord_createdAt_idx"            ON "ApprovalRecord"("createdAt");

-- ── LoginEvent — security event log ──────────────────────────────────────────
CREATE TABLE "LoginEvent" (
  "id"            TEXT        NOT NULL,
  "createdAt"     TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "email"         TEXT        NOT NULL,
  "userId"        TEXT,
  "success"       BOOLEAN     NOT NULL,
  "ipAddress"     TEXT        NOT NULL DEFAULT 'unknown',
  "userAgent"     TEXT        NOT NULL DEFAULT 'unknown',
  "failureReason" TEXT,
  CONSTRAINT "LoginEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "LoginEvent_email_idx"     ON "LoginEvent"("email");
CREATE INDEX "LoginEvent_createdAt_idx" ON "LoginEvent"("createdAt");

-- ── LoginAttempt — per-email brute-force lockout tracker ─────────────────────
CREATE TABLE "LoginAttempt" (
  "id"            TEXT        NOT NULL,
  "email"         TEXT        NOT NULL,
  "attempts"      INTEGER     NOT NULL DEFAULT 0,
  "lastAttemptAt" TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "lockedUntil"   TIMESTAMP,
  "updatedAt"     TIMESTAMP   NOT NULL,
  CONSTRAINT "LoginAttempt_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LoginAttempt_email_key" ON "LoginAttempt"("email");

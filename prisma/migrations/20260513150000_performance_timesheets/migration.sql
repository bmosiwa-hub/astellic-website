-- Add supervisor self-reference to Employee
ALTER TABLE "Employee" ADD COLUMN "supervisorId" TEXT;
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_supervisorId_fkey"
  FOREIGN KEY ("supervisorId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- PerformanceCycle
CREATE TABLE "PerformanceCycle" (
    "id"             TEXT NOT NULL,
    "employeeId"     TEXT NOT NULL,
    "cycleType"      TEXT NOT NULL,
    "year"           INTEGER NOT NULL,
    "startDate"      TIMESTAMP(3) NOT NULL,
    "endDate"        TIMESTAMP(3) NOT NULL,
    "status"         TEXT NOT NULL DEFAULT 'OBJECTIVES_DRAFT',
    "supervisorNote" TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PerformanceCycle_pkey"        PRIMARY KEY ("id"),
    CONSTRAINT "PerformanceCycle_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "PerformanceCycle_employeeId_idx" ON "PerformanceCycle"("employeeId");
CREATE INDEX "PerformanceCycle_status_idx"     ON "PerformanceCycle"("status");

-- PerformanceObjective
CREATE TABLE "PerformanceObjective" (
    "id"          TEXT NOT NULL,
    "cycleId"     TEXT NOT NULL,
    "title"       TEXT NOT NULL,
    "description" TEXT,
    "weight"      DOUBLE PRECISION,
    "target"      TEXT,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PerformanceObjective_pkey"      PRIMARY KEY ("id"),
    CONSTRAINT "PerformanceObjective_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "PerformanceCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- PerformanceReview
CREATE TABLE "PerformanceReview" (
    "id"            TEXT NOT NULL,
    "cycleId"       TEXT NOT NULL,
    "reviewType"    TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "overallRating" DOUBLE PRECISION,
    "strengths"     TEXT,
    "improvements"  TEXT,
    "comments"      TEXT,
    "submittedAt"   TIMESTAMP(3),
    "status"        TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PerformanceReview_pkey"             PRIMARY KEY ("id"),
    CONSTRAINT "PerformanceReview_cycleId_key"      UNIQUE ("cycleId", "reviewType"),
    CONSTRAINT "PerformanceReview_cycleId_fkey"     FOREIGN KEY ("cycleId")       REFERENCES "PerformanceCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "PerformanceReview_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- ObjectiveRating
CREATE TABLE "ObjectiveRating" (
    "id"          TEXT NOT NULL,
    "reviewId"    TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "rating"      DOUBLE PRECISION NOT NULL,
    "comment"     TEXT,
    CONSTRAINT "ObjectiveRating_pkey"           PRIMARY KEY ("id"),
    CONSTRAINT "ObjectiveRating_reviewId_fkey"    FOREIGN KEY ("reviewId")    REFERENCES "PerformanceReview"("id")    ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ObjectiveRating_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "PerformanceObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CEODecision
CREATE TABLE "CEODecision" (
    "id"          TEXT NOT NULL,
    "cycleId"     TEXT NOT NULL,
    "overallScore" DOUBLE PRECISION,
    "outcome"     TEXT,
    "comments"    TEXT,
    "decidedById" TEXT,
    "decidedAt"   TIMESTAMP(3),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CEODecision_pkey"          PRIMARY KEY ("id"),
    CONSTRAINT "CEODecision_cycleId_key"   UNIQUE ("cycleId"),
    CONSTRAINT "CEODecision_cycleId_fkey"  FOREIGN KEY ("cycleId")     REFERENCES "PerformanceCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CEODecision_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Timesheet
CREATE TABLE "Timesheet" (
    "id"             TEXT NOT NULL,
    "employeeId"     TEXT NOT NULL,
    "month"          INTEGER NOT NULL,
    "year"           INTEGER NOT NULL,
    "status"         TEXT NOT NULL DEFAULT 'DRAFT',
    "supervisorNote" TEXT,
    "reviewedAt"     TIMESTAMP(3),
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Timesheet_pkey"              PRIMARY KEY ("id"),
    CONSTRAINT "Timesheet_employeeId_month_year_key" UNIQUE ("employeeId", "month", "year"),
    CONSTRAINT "Timesheet_employeeId_fkey"   FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "Timesheet_status_idx" ON "Timesheet"("status");

-- TimesheetEntry
CREATE TABLE "TimesheetEntry" (
    "id"          TEXT NOT NULL,
    "timesheetId" TEXT NOT NULL,
    "date"        TIMESTAMP(3) NOT NULL,
    "activity"    TEXT NOT NULL,
    "project"     TEXT,
    "hours"       DOUBLE PRECISION NOT NULL,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TimesheetEntry_pkey"           PRIMARY KEY ("id"),
    CONSTRAINT "TimesheetEntry_timesheetId_fkey" FOREIGN KEY ("timesheetId") REFERENCES "Timesheet"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "TimesheetEntry_timesheetId_idx" ON "TimesheetEntry"("timesheetId");
CREATE INDEX "TimesheetEntry_date_idx"        ON "TimesheetEntry"("date");

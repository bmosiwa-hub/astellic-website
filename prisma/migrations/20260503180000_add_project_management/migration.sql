-- CreateEnum
CREATE TYPE "ThematicArea" AS ENUM ('ECONOMIC_DEVELOPMENT', 'GOVERNANCE', 'SOCIAL_DEVELOPMENT', 'HEALTH');

-- CreateEnum
CREATE TYPE "ProjectType" AS ENUM ('PRIVATE', 'PUBLIC');

-- CreateEnum
CREATE TYPE "MilestoneStatus" AS ENUM ('PENDING', 'COMPLETION_REQUESTED', 'APPROVED', 'REJECTED');

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'PROJECT_MANAGER';

-- AlterTable: Project
ALTER TABLE "Project" ADD COLUMN "thematicArea" "ThematicArea",
                      ADD COLUMN "projectType"  "ProjectType",
                      ADD COLUMN "projectLead"  TEXT;

-- AlterTable: Employee
ALTER TABLE "Employee" ADD COLUMN "pensionRate" DOUBLE PRECISION NOT NULL DEFAULT 5;

-- AlterTable: AccountReceivable
ALTER TABLE "AccountReceivable" ADD COLUMN "milestoneId" TEXT;

-- CreateTable: ProjectMember
CREATE TABLE "ProjectMember" (
    "id"        TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name"      TEXT NOT NULL,
    "email"     TEXT,
    "role"      TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProjectMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Milestone
CREATE TABLE "Milestone" (
    "id"              TEXT NOT NULL,
    "projectId"       TEXT NOT NULL,
    "title"           TEXT NOT NULL,
    "description"     TEXT,
    "deliveryDate"    TIMESTAMP(3) NOT NULL,
    "paymentExpected" DOUBLE PRECISION,
    "currency"        TEXT NOT NULL DEFAULT 'MWK',
    "order"           INTEGER NOT NULL DEFAULT 0,
    "status"          "MilestoneStatus" NOT NULL DEFAULT 'PENDING',
    "completedBy"     TEXT,
    "completedAt"     TIMESTAMP(3),
    "approvedBy"      TEXT,
    "approvedAt"      TIMESTAMP(3),
    "rejectionNote"   TEXT,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AccountReceivable_milestoneId_key" ON "AccountReceivable"("milestoneId");

-- AddForeignKey
ALTER TABLE "ProjectMember" ADD CONSTRAINT "ProjectMember_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_projectId_fkey"
    FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_completedBy_fkey"
    FOREIGN KEY ("completedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_approvedBy_fkey"
    FOREIGN KEY ("approvedBy") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountReceivable" ADD CONSTRAINT "AccountReceivable_milestoneId_fkey"
    FOREIGN KEY ("milestoneId") REFERENCES "Milestone"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Migrate PilotDomain enum from HEALTH|GOVERNANCE|EDUCATION|CLIMATE
-- to HEALTH|ENVIRONMENTAL_SUSTAINABILITY|GENDER
--
-- Safe: no pilot data exists at this point. The three affected columns
-- are temporarily cast to TEXT, the old enum is dropped, the new enum
-- is created, and the columns are restored.

-- Step 1: detach columns from the enum
ALTER TABLE "PilotProfile"       ALTER COLUMN "domain" TYPE TEXT;
ALTER TABLE "KnowledgeProduct"   ALTER COLUMN "domain" TYPE TEXT;
ALTER TABLE "IntelligenceEntry"  ALTER COLUMN "domain" TYPE TEXT;

-- Step 2: drop old enum
DROP TYPE "PilotDomain";

-- Step 3: create new enum
CREATE TYPE "PilotDomain" AS ENUM ('HEALTH', 'ENVIRONMENTAL_SUSTAINABILITY', 'GENDER');

-- Step 4: restore columns using new enum
ALTER TABLE "PilotProfile"       ALTER COLUMN "domain" TYPE "PilotDomain" USING "domain"::"PilotDomain";
ALTER TABLE "KnowledgeProduct"   ALTER COLUMN "domain" TYPE "PilotDomain" USING "domain"::"PilotDomain";
ALTER TABLE "IntelligenceEntry"  ALTER COLUMN "domain" TYPE "PilotDomain" USING "domain"::"PilotDomain";

CREATE TABLE IF NOT EXISTS saved_jobs (
  id TEXT NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId" TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  "jobId" TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("userId", "jobId")
);

UPDATE jobs SET type = 'FULL_TIME' WHERE status = 'PUBLISHED' AND (ROW_NUMBER() OVER (ORDER BY "createdAt"))::int % 5 = 0;
UPDATE jobs SET type = 'PART_TIME' WHERE id IN (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") AS rn FROM jobs WHERE status = 'PUBLISHED') t WHERE t.rn % 5 = 1);
UPDATE jobs SET type = 'REMOTE' WHERE id IN (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") AS rn FROM jobs WHERE status = 'PUBLISHED') t WHERE t.rn % 5 = 2);
UPDATE jobs SET type = 'HYBRID' WHERE id IN (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") AS rn FROM jobs WHERE status = 'PUBLISHED') t WHERE t.rn % 5 = 3);
UPDATE jobs SET type = 'CONTRACT' WHERE id IN (SELECT id FROM (SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt") AS rn FROM jobs WHERE status = 'PUBLISHED') t WHERE t.rn % 5 = 4);

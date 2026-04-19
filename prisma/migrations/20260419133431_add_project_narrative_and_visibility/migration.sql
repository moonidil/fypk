/*
  Warnings:

  - You are about to drop the column `status` on the `Project` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('DRAFT', 'PRIVATE', 'PUBLIC');

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "status",
ADD COLUMN     "approach" TEXT,
ADD COLUMN     "outcome" TEXT,
ADD COLUMN     "problem" TEXT,
ADD COLUMN     "reflection" TEXT,
ADD COLUMN     "visibility" "Visibility" NOT NULL DEFAULT 'DRAFT';

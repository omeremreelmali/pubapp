/*
  Warnings:

  - You are about to drop the column `organizationId` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `users` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "users" DROP CONSTRAINT "users_organizationId_fkey";

-- AlterTable
ALTER TABLE "apps" ADD COLUMN     "iosBundleId" TEXT,
ADD COLUMN     "iosDistributionType" TEXT,
ADD COLUMN     "iosMinimumVersion" TEXT,
ADD COLUMN     "iosProvisioningProfile" TEXT,
ADD COLUMN     "iosSupportedDevices" TEXT,
ADD COLUMN     "iosTeamId" TEXT;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "organizationId",
DROP COLUMN "role";

-- CreateTable
CREATE TABLE "organization_members" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'TESTER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organization_members_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organization_members_userId_organizationId_key" ON "organization_members"("userId", "organizationId");

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organization_members" ADD CONSTRAINT "organization_members_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

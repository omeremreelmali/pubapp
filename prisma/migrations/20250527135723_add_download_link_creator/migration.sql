/*
  Warnings:

  - Added the required column `createdById` to the `download_links` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "download_links" ADD COLUMN     "createdById" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "download_links" ADD CONSTRAINT "download_links_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

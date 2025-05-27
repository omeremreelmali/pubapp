/*
  Warnings:

  - You are about to drop the column `filePath` on the `app_versions` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[buildNumber,appId]` on the table `app_versions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `originalFileName` to the `app_versions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "app_versions" DROP COLUMN "filePath",
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "originalFileName" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "app_versions_buildNumber_appId_key" ON "app_versions"("buildNumber", "appId");

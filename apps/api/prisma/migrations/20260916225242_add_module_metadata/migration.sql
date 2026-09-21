/*
  Warnings:

  - You are about to drop the column `name` on the `app_modules` table. All the data in the column will be lost.
  - Added the required column `icon` to the `app_modules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `label` to the `app_modules` table without a default value. This is not possible if the table is not empty.
  - Added the required column `route` to the `app_modules` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "app_modules" DROP COLUMN "name",
ADD COLUMN     "icon" TEXT NOT NULL,
ADD COLUMN     "label" TEXT NOT NULL,
ADD COLUMN     "route" TEXT NOT NULL;

/*
  Warnings:

  - Added the required column `particleDeviceId` to the `Building` table without a default value. This is not possible if the table is not empty.
  - Added the required column `particleToken` to the `Building` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Building" ADD COLUMN     "particleDeviceId" TEXT NOT NULL,
ADD COLUMN     "particleToken" TEXT NOT NULL;

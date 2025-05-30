/*
  Warnings:

  - You are about to drop the `_ElectricalDataToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ElectricalDataToUser" DROP CONSTRAINT "_ElectricalDataToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ElectricalDataToUser" DROP CONSTRAINT "_ElectricalDataToUser_B_fkey";

-- AlterTable
ALTER TABLE "ElectricalData" ADD COLUMN     "buildingId" TEXT,
ADD COLUMN     "isSynthesized" BOOLEAN DEFAULT false;

-- DropTable
DROP TABLE "_ElectricalDataToUser";

-- CreateTable
CREATE TABLE "Building" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Building_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_UserBuildings" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_UserBuildings_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Building_name_key" ON "Building"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Building_deviceId_key" ON "Building"("deviceId");

-- CreateIndex
CREATE INDEX "_UserBuildings_B_index" ON "_UserBuildings"("B");

-- AddForeignKey
ALTER TABLE "ElectricalData" ADD CONSTRAINT "ElectricalData_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserBuildings" ADD CONSTRAINT "_UserBuildings_A_fkey" FOREIGN KEY ("A") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_UserBuildings" ADD CONSTRAINT "_UserBuildings_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

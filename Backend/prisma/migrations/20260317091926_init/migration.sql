/*
  Warnings:

  - You are about to drop the column `adminId` on the `AllStudents` table. All the data in the column will be lost.
  - Added the required column `eventId` to the `AllStudents` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AllStudents" DROP CONSTRAINT "AllStudents_adminId_fkey";

-- AlterTable
ALTER TABLE "AllStudents" DROP COLUMN "adminId",
ADD COLUMN     "eventId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "EventInfo" (
    "id" SERIAL NOT NULL,
    "adminAddress" TEXT NOT NULL,
    "eventName" TEXT NOT NULL,
    "eventId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventInfo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventInfo_eventId_key" ON "EventInfo"("eventId");

-- AddForeignKey
ALTER TABLE "EventInfo" ADD CONSTRAINT "EventInfo_adminAddress_fkey" FOREIGN KEY ("adminAddress") REFERENCES "Admins"("address") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllStudents" ADD CONSTRAINT "AllStudents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "EventInfo"("eventId") ON DELETE RESTRICT ON UPDATE CASCADE;

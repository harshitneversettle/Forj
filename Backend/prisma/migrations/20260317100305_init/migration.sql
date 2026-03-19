/*
  Warnings:

  - You are about to drop the `EventInfo` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AllStudents" DROP CONSTRAINT "AllStudents_eventId_fkey";

-- DropForeignKey
ALTER TABLE "EventInfo" DROP CONSTRAINT "EventInfo_adminAddress_fkey";

-- DropTable
DROP TABLE "EventInfo";

-- CreateTable
CREATE TABLE "Events" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "eventName" TEXT NOT NULL,
    "issueAmount" INTEGER NOT NULL,
    "eventId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Events_eventId_key" ON "Events"("eventId");

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AllStudents" ADD CONSTRAINT "AllStudents_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("eventId") ON DELETE RESTRICT ON UPDATE CASCADE;

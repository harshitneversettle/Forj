/*
  Warnings:

  - You are about to drop the column `issueAmount` on the `Admins` table. All the data in the column will be lost.
  - Added the required column `issueAmount` to the `EventInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Admins" DROP COLUMN "issueAmount";

-- AlterTable
ALTER TABLE "EventInfo" ADD COLUMN     "issueAmount" INTEGER NOT NULL;

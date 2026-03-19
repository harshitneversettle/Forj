-- CreateTable
CREATE TABLE "Admins" (
    "id" SERIAL NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AllStudents" (
    "id" SERIAL NOT NULL,
    "adminId" INTEGER NOT NULL,
    "studentmail" TEXT NOT NULL,
    "claimStatus" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AllStudents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admins_address_key" ON "Admins"("address");

-- CreateIndex
CREATE UNIQUE INDEX "AllStudents_studentmail_key" ON "AllStudents"("studentmail");

-- AddForeignKey
ALTER TABLE "AllStudents" ADD CONSTRAINT "AllStudents_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "Admins"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

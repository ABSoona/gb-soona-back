/*
  Warnings:

  - You are about to drop the column `contactId` on the `Visite` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[demandeId]` on the table `Visite` will be added. If there are existing duplicate values, this will fail.
  - Made the column `contactId` on table `Aide` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contactId` on table `Demande` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Aide" DROP CONSTRAINT "Aide_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Demande" DROP CONSTRAINT "Demande_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Visite" DROP CONSTRAINT "Visite_contactId_fkey";

-- AlterTable
ALTER TABLE "Aide" ALTER COLUMN "contactId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Demande" ALTER COLUMN "contactId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Visite" DROP COLUMN "contactId",
ADD COLUMN     "demandeId" INTEGER;

-- CreateTable
CREATE TABLE "Invitation" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT,
    "id" TEXT NOT NULL,
    "message" TEXT,
    "role" TEXT,
    "token" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "used" TEXT,

    CONSTRAINT "Invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Visite_demandeId_key" ON "Visite"("demandeId");

-- AddForeignKey
ALTER TABLE "Aide" ADD CONSTRAINT "Aide_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visite" ADD CONSTRAINT "Visite_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

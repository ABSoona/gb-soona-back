/*
  Warnings:

  - You are about to drop the column `contactId` on the `Visite` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[demandeId]` on the table `Visite` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Visite" DROP CONSTRAINT "Visite_contactId_fkey";

-- AlterTable
ALTER TABLE "Visite" DROP COLUMN "contactId",
ADD COLUMN     "demandeId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Visite_demandeId_key" ON "Visite"("demandeId");

-- AddForeignKey
ALTER TABLE "Visite" ADD CONSTRAINT "Visite_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

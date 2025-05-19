/*
  Warnings:

  - Made the column `demandeId` on table `Visite` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Visite" DROP CONSTRAINT "Visite_demandeId_fkey";

-- AlterTable
ALTER TABLE "Visite" ALTER COLUMN "demandeId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Visite" ADD CONSTRAINT "Visite_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

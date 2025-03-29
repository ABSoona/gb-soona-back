/*
  Warnings:

  - Made the column `contactId` on table `Aide` required. This step will fail if there are existing NULL values in that column.
  - Made the column `contactId` on table `Demande` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Aide" DROP CONSTRAINT "Aide_contactId_fkey";

-- DropForeignKey
ALTER TABLE "Demande" DROP CONSTRAINT "Demande_contactId_fkey";

-- AlterTable
ALTER TABLE "Aide" ALTER COLUMN "contactId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Demande" ALTER COLUMN "contactId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Aide" ADD CONSTRAINT "Aide_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

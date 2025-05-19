/*
  Warnings:

  - A unique constraint covering the columns `[visitesId]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EnumVisiteStatus" AS ENUM ('Programee', 'Realisee', 'Annulee');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "visitesId" INTEGER;

-- CreateTable
CREATE TABLE "Visite" (
    "acteurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dateVisite" TIMESTAMP(3),
    "demandeId" INTEGER,
    "id" SERIAL NOT NULL,
    "note" TEXT,
    "status" "EnumVisiteStatus",
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Visite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_visitesId_key" ON "Document"("visitesId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_visitesId_fkey" FOREIGN KEY ("visitesId") REFERENCES "Visite"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visite" ADD CONSTRAINT "Visite_acteurId_fkey" FOREIGN KEY ("acteurId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Visite" ADD CONSTRAINT "Visite_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

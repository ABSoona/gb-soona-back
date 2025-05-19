/*
  Warnings:

  - A unique constraint covering the columns `[versementsId]` on the table `Document` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EnumVersementStatus" AS ENUM ('AVerser', 'Verse');

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "versementsId" INTEGER;

-- CreateTable
CREATE TABLE "Versement" (
    "aideId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataVersement" TIMESTAMP(3) NOT NULL,
    "id" SERIAL NOT NULL,
    "status" "EnumVersementStatus" NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Versement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_versementsId_key" ON "Document"("versementsId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_versementsId_fkey" FOREIGN KEY ("versementsId") REFERENCES "Versement"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Versement" ADD CONSTRAINT "Versement_aideId_fkey" FOREIGN KEY ("aideId") REFERENCES "Aide"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

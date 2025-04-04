/*
  Warnings:

  - You are about to drop the `Visite` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Visite" DROP CONSTRAINT "Visite_demandeId_fkey";

-- DropTable
DROP TABLE "Visite";

-- CreateTable
CREATE TABLE "WebsiteDemande" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "id" TEXT NOT NULL,
    "nomDemandeur" TEXT,
    "prenomDemandeur" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WebsiteDemande_pkey" PRIMARY KEY ("id")
);

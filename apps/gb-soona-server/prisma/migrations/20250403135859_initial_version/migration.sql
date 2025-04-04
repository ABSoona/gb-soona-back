/*
  Warnings:

  - Added the required column `payload` to the `WebsiteDemande` table without a default value. This is not possible if the table is not empty.
  - Made the column `nomDemandeur` on table `WebsiteDemande` required. This step will fail if there are existing NULL values in that column.
  - Made the column `prenomDemandeur` on table `WebsiteDemande` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ageDemandeur` on table `WebsiteDemande` required. This step will fail if there are existing NULL values in that column.
  - Made the column `emailDemandeur` on table `WebsiteDemande` required. This step will fail if there are existing NULL values in that column.
  - Made the column `status` on table `WebsiteDemande` required. This step will fail if there are existing NULL values in that column.
  - Made the column `telephoneDemandeur` on table `WebsiteDemande` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "WebsiteDemande" ADD COLUMN     "payload" JSONB NOT NULL,
ALTER COLUMN "nomDemandeur" SET NOT NULL,
ALTER COLUMN "prenomDemandeur" SET NOT NULL,
ALTER COLUMN "ageDemandeur" SET NOT NULL,
ALTER COLUMN "emailDemandeur" SET NOT NULL,
ALTER COLUMN "status" SET NOT NULL,
ALTER COLUMN "telephoneDemandeur" SET NOT NULL;

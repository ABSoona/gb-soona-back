/*
  Warnings:

  - You are about to drop the column `payload` on the `WebsiteDemande` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WebsiteDemande" DROP COLUMN "payload",
ADD COLUMN     "adresseDemandeur" TEXT,
ADD COLUMN     "agesEnfants" TEXT,
ADD COLUMN     "apl" INTEGER,
ADD COLUMN     "autresAides" TEXT,
ADD COLUMN     "autresCharges" INTEGER,
ADD COLUMN     "codePostalDemandeur" INTEGER,
ADD COLUMN     "dettes" INTEGER,
ADD COLUMN     "facturesEnergie" INTEGER,
ADD COLUMN     "loyer" INTEGER,
ADD COLUMN     "natureDettes" TEXT,
ADD COLUMN     "nombreEnfants" INTEGER,
ADD COLUMN     "remarques" TEXT,
ADD COLUMN     "revenus" INTEGER,
ADD COLUMN     "revenusConjoint" INTEGER,
ADD COLUMN     "situationFamiliale" TEXT,
ADD COLUMN     "situationProConjoint" TEXT,
ADD COLUMN     "situationProfessionnelle" TEXT,
ADD COLUMN     "villeDemandeur" TEXT,
ALTER COLUMN "nomDemandeur" DROP NOT NULL,
ALTER COLUMN "prenomDemandeur" DROP NOT NULL,
ALTER COLUMN "ageDemandeur" DROP NOT NULL,
ALTER COLUMN "emailDemandeur" DROP NOT NULL,
ALTER COLUMN "telephoneDemandeur" DROP NOT NULL;

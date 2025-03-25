-- CreateEnum
CREATE TYPE "EnumAideCrediteur" AS ENUM ('LeBNFiciaire', 'UnCrAncier');

-- AlterTable
ALTER TABLE "Aide" ADD COLUMN     "crediteur" "EnumAideCrediteur",
ADD COLUMN     "infosCrediteur" TEXT,
ADD COLUMN     "remarque" TEXT;

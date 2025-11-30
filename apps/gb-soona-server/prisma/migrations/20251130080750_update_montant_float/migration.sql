/*
  Warnings:

  - You are about to alter the column `montant` on the `Versement` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "Aide" ALTER COLUMN "montant" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Versement" ALTER COLUMN "montant" SET DATA TYPE DOUBLE PRECISION;

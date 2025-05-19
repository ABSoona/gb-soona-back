/*
  Warnings:

  - Added the required column `montant` to the `Versement` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Versement" ADD COLUMN     "montant" INTEGER NOT NULL;

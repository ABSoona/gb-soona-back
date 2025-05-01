/*
  Warnings:

  - Added the required column `titre` to the `DemandeActivity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DemandeActivity" ADD COLUMN     "titre" TEXT NOT NULL;

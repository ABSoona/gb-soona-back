/*
  Warnings:

  - Added the required column `rattachement` to the `TypeDocument` table without a default value. This is not possible if the table is not empty.
  - Made the column `label` on table `TypeDocument` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "EnumTypeDocumentRattachement" AS ENUM ('Contact', 'Demande');

-- AlterTable
ALTER TABLE "TypeDocument" ADD COLUMN     "rattachement" "EnumTypeDocumentRattachement" NOT NULL,
ALTER COLUMN "label" SET NOT NULL;

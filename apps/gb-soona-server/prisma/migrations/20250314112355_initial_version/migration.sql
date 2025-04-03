/*
  Warnings:

  - The `typeField` column on the `Aide` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "EnumAideTypeField" AS ENUM ('Alimentaire');

-- AlterEnum
ALTER TYPE "EnumAideFrequence" ADD VALUE 'Unefois';

-- AlterTable
ALTER TABLE "Aide" ADD COLUMN     "reexaminer" BOOLEAN,
DROP COLUMN "typeField",
ADD COLUMN     "typeField" "EnumAideTypeField";

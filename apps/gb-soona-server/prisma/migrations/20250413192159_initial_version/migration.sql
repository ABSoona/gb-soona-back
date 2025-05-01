/*
  Warnings:

  - The values [Alimentaire] on the enum `EnumAideTypeField` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EnumAideTypeField_new" AS ENUM ('AssistanceAdministrative', 'FinanciRe');
ALTER TABLE "Aide" ALTER COLUMN "typeField" TYPE "EnumAideTypeField_new" USING ("typeField"::text::"EnumAideTypeField_new");
ALTER TYPE "EnumAideTypeField" RENAME TO "EnumAideTypeField_old";
ALTER TYPE "EnumAideTypeField_new" RENAME TO "EnumAideTypeField";
DROP TYPE "EnumAideTypeField_old";
COMMIT;

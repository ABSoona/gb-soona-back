-- CreateEnum
CREATE TYPE "EnumDemandeCategorieDemandeur" AS ENUM ('LourdementEndett', 'NCessiteux', 'Pauvre');

-- AlterTable
ALTER TABLE "Demande" ADD COLUMN     "categorieDemandeur" "EnumDemandeCategorieDemandeur";

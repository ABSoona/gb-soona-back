-- CreateEnum
CREATE TYPE "EnumAideFrequence" AS ENUM ('Mensuelle', 'BiMensuelle', 'Trimestrielle', 'Hebdomadaire');

-- AlterTable
ALTER TABLE "Aide" ADD COLUMN     "frequence" "EnumAideFrequence",
ADD COLUMN     "status" TEXT;

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "contenu" JSONB;

-- AlterTable
ALTER TABLE "Visite" ADD COLUMN     "dateVisite" TIMESTAMP(3),
ADD COLUMN     "rapportVisite" TEXT;

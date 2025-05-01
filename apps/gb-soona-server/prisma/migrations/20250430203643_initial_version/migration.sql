-- CreateEnum
CREATE TYPE "EnumAideStatus" AS ENUM ('EnCours', 'Expir');

-- AlterTable
ALTER TABLE "Aide" ADD COLUMN     "reetudier" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "EnumAideStatus" NOT NULL DEFAULT 'EnCours';

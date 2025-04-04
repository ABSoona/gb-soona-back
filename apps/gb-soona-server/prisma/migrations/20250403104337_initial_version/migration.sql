-- CreateEnum
CREATE TYPE "EnumWebsiteDemandeStatus" AS ENUM ('EnCours', 'EnErreur', 'Trait');

-- AlterTable
ALTER TABLE "WebsiteDemande" ADD COLUMN     "emailDemandeur" TEXT,
ADD COLUMN     "erreur" TEXT,
ADD COLUMN     "status" "EnumWebsiteDemandeStatus",
ADD COLUMN     "telephoneDemandeur" TEXT;

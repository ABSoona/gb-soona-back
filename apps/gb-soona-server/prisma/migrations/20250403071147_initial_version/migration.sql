-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "dateVisite" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Demande" ADD COLUMN     "dateVisite" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "WebsiteDemande" ADD COLUMN     "ageDemandeur" INTEGER;

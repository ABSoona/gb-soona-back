-- AlterTable
ALTER TABLE "Demande" ADD COLUMN     "dernierContact" TIMESTAMP(3),
ADD COLUMN     "derniereRelance" TIMESTAMP(3),
ADD COLUMN     "nombreRelances" INTEGER,
ADD COLUMN     "recommandation" TEXT;

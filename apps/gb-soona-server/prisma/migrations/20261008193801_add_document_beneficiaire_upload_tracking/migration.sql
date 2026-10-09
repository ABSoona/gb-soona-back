-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "consultedAt" TIMESTAMP(3),
ADD COLUMN     "uploadedByBeneficiaire" BOOLEAN NOT NULL DEFAULT false;

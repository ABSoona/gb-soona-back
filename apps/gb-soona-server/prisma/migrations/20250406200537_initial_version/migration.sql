-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "demandeId" INTEGER;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

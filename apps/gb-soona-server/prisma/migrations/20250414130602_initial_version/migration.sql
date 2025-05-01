-- AlterTable
ALTER TABLE "Aide" ADD COLUMN     "demandeId" INTEGER;

-- AddForeignKey
ALTER TABLE "Aide" ADD CONSTRAINT "Aide_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE SET NULL ON UPDATE CASCADE;

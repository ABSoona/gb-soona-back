-- DropForeignKey
ALTER TABLE "DemandeStatusHistory" DROP CONSTRAINT "DemandeStatusHistory_demandeId_fkey";

-- AddForeignKey
ALTER TABLE "DemandeStatusHistory" ADD CONSTRAINT "DemandeStatusHistory_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

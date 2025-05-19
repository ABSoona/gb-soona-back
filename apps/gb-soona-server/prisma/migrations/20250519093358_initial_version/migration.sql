-- DropForeignKey
ALTER TABLE "DemandeActivity" DROP CONSTRAINT "DemandeActivity_demandeId_fkey";

-- AddForeignKey
ALTER TABLE "DemandeActivity" ADD CONSTRAINT "DemandeActivity_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

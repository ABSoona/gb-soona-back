-- DropForeignKey
ALTER TABLE "Visite" DROP CONSTRAINT "Visite_demandeId_fkey";

-- AddForeignKey
ALTER TABLE "Visite" ADD CONSTRAINT "Visite_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

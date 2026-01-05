-- AlterTable
ALTER TABLE "Aide" ADD COLUMN     "acteurVersementId" TEXT;

-- AddForeignKey
ALTER TABLE "Aide" ADD CONSTRAINT "Aide_acteurVersementId_fkey" FOREIGN KEY ("acteurVersementId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

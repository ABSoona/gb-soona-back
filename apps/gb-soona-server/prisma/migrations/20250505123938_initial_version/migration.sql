-- AlterTable
ALTER TABLE "Demande" ADD COLUMN     "acteurId" TEXT,
ADD COLUMN     "proprietaireId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "adresseCodePostal" TEXT,
ADD COLUMN     "adresseRue" TEXT,
ADD COLUMN     "adresseVille" TEXT,
ADD COLUMN     "superieurId" TEXT;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_acteurId_fkey" FOREIGN KEY ("acteurId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Demande" ADD CONSTRAINT "Demande_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_superieurId_fkey" FOREIGN KEY ("superieurId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

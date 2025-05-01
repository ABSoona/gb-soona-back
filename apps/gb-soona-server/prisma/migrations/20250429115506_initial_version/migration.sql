-- AlterTable
ALTER TABLE "DemandeActivity" ADD COLUMN     "userId" TEXT;

-- AddForeignKey
ALTER TABLE "DemandeActivity" ADD CONSTRAINT "DemandeActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

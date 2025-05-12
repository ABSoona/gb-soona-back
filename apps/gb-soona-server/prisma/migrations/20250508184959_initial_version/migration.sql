-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "aideId" INTEGER;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_aideId_fkey" FOREIGN KEY ("aideId") REFERENCES "Aide"("id") ON DELETE SET NULL ON UPDATE CASCADE;

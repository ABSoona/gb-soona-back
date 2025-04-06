-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "typeDocumentId" INTEGER;

-- CreateTable
CREATE TABLE "TypeDocument" (
    "id" SERIAL NOT NULL,
    "label" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypeDocument_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_typeDocumentId_fkey" FOREIGN KEY ("typeDocumentId") REFERENCES "TypeDocument"("id") ON DELETE SET NULL ON UPDATE CASCADE;

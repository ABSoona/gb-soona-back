-- AlterTable
ALTER TABLE "TypeDocument" ADD COLUMN     "description" TEXT,
ADD COLUMN     "publicUploadEnabled" BOOLEAN NOT NULL DEFAULT true;

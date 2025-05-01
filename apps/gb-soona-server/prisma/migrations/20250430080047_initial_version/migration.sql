-- AlterTable
ALTER TABLE "TypeDocument" ADD COLUMN     "internalCode" TEXT,
ADD COLUMN     "isInternal" BOOLEAN NOT NULL DEFAULT false;

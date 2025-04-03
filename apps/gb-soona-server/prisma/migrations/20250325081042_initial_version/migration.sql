-- AlterTable
ALTER TABLE "Contact" ADD COLUMN     "dateCreation" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Demande" ALTER COLUMN "createdAt" DROP NOT NULL;

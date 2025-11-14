/*
  Warnings:

  - You are about to drop the column `dateCreation` on the `Contact` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Contact" DROP COLUMN "dateCreation",
ADD COLUMN     "dateNaissance" TIMESTAMP(3);

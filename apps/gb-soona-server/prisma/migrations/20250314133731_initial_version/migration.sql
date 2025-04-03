/*
  Warnings:

  - You are about to drop the column `paiementRecurrent` on the `Aide` table. All the data in the column will be lost.
  - You are about to drop the column `reexaminer` on the `Aide` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `Aide` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Aide" DROP COLUMN "paiementRecurrent",
DROP COLUMN "reexaminer",
DROP COLUMN "status",
ADD COLUMN     "suspendue" BOOLEAN;

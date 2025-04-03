/*
  Warnings:

  - A unique constraint covering the columns `[role]` on the table `Invitation` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `Invitation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `role` on table `Invitation` required. This step will fail if there are existing NULL values in that column.
  - Made the column `token` on table `Invitation` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `used` to the `Invitation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invitation" ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "role" SET NOT NULL,
ALTER COLUMN "token" SET NOT NULL,
DROP COLUMN "used",
ADD COLUMN     "used" BOOLEAN NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Invitation_role_key" ON "Invitation"("role");

/*
  Warnings:

  - A unique constraint covering the columns `[internalCode]` on the table `TypeDocument` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TypeDocument_internalCode_key" ON "TypeDocument"("internalCode");

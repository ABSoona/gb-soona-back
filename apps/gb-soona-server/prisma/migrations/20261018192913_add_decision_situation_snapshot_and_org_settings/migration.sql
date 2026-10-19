-- AlterTable
ALTER TABLE "DemandeSituationHistory" ADD COLUMN     "decisionId" INTEGER;

-- CreateTable
CREATE TABLE "OrganizationSettings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nom" TEXT,
    "adresse" TEXT,
    "rna" TEXT,
    "email" TEXT,
    "telephone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DemandeSituationHistory_decisionId_key" ON "DemandeSituationHistory"("decisionId");

-- AddForeignKey
ALTER TABLE "DemandeSituationHistory" ADD CONSTRAINT "DemandeSituationHistory_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE SET NULL ON UPDATE CASCADE;


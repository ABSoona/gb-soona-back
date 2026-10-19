-- CreateEnum
CREATE TYPE "EnumDecisionType" AS ENUM ('Approbation', 'Refus', 'Ajournement');

-- AlterTable
ALTER TABLE "Aide" ADD COLUMN     "decisionId" INTEGER;

-- CreateTable
CREATE TABLE "Comite" (
    "id" SERIAL NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Comite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Decision" (
    "id" SERIAL NOT NULL,
    "type" "EnumDecisionType" NOT NULL,
    "motivation" TEXT,
    "comiteId" INTEGER NOT NULL,
    "demandeId" INTEGER NOT NULL,
    "acteurId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Decision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Comite_date_key" ON "Comite"("date");

-- AddForeignKey
ALTER TABLE "Aide" ADD CONSTRAINT "Aide_decisionId_fkey" FOREIGN KEY ("decisionId") REFERENCES "Decision"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_comiteId_fkey" FOREIGN KEY ("comiteId") REFERENCES "Comite"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Decision" ADD CONSTRAINT "Decision_acteurId_fkey" FOREIGN KEY ("acteurId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "DemandeSituationHistory" (
    "id" SERIAL NOT NULL,
    "demandeId" INTEGER NOT NULL,
    "creeParId" TEXT,
    "nombreEnfants" INTEGER,
    "nombrePersonnes" INTEGER,
    "agesEnfants" TEXT,
    "situationFamiliale" TEXT,
    "situationProfessionnelle" TEXT,
    "situationProConjoint" TEXT,
    "revenus" INTEGER,
    "revenusConjoint" INTEGER,
    "loyer" INTEGER,
    "facturesEnergie" INTEGER,
    "dettes" INTEGER,
    "natureDettes" TEXT,
    "autresAides" TEXT,
    "autresCharges" INTEGER,
    "apl" INTEGER,
    "categorieDemandeur" "EnumDemandeCategorieDemandeur",
    "remarques" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandeSituationHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DemandeSituationHistory" ADD CONSTRAINT "DemandeSituationHistory_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandeSituationHistory" ADD CONSTRAINT "DemandeSituationHistory_creeParId_fkey" FOREIGN KEY ("creeParId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

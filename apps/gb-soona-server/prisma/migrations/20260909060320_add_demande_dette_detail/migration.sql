-- CreateTable
CREATE TABLE "DemandeDetteDetail" (
    "id" SERIAL NOT NULL,
    "demandeId" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandeDetteDetail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DemandeDetteDetail" ADD CONSTRAINT "DemandeDetteDetail_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

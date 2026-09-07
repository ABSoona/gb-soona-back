-- CreateTable
CREATE TABLE "DemandeAutreCharge" (
    "id" SERIAL NOT NULL,
    "demandeId" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    "montant" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandeAutreCharge_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DemandeAutreCharge" ADD CONSTRAINT "DemandeAutreCharge_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "DemandeActivity" (
    "aideId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "demandeId" INTEGER NOT NULL,
    "id" SERIAL NOT NULL,
    "message" TEXT,
    "typeField" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DemandeActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "DemandeActivity" ADD CONSTRAINT "DemandeActivity_aideId_fkey" FOREIGN KEY ("aideId") REFERENCES "Aide"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandeActivity" ADD CONSTRAINT "DemandeActivity_demandeId_fkey" FOREIGN KEY ("demandeId") REFERENCES "Demande"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

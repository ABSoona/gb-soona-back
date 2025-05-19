// src/demande/helpers/demande-activity.helper.ts
import { PrismaClient, Demande } from "@prisma/client";
import { demandeStatusLabels } from "./demande.data";

export async function logStatusChange(prisma: PrismaClient, oldStatus: string, newStatus: string, demandeId: number) {
  const previousLabel = demandeStatusLabels.find(e => e.value === oldStatus)?.label;
  const currentLabel = demandeStatusLabels.find(e => e.value === newStatus)?.label;

  await prisma.demandeStatusHistory.create({
    data: { demandeId, status: newStatus },
  });

  await prisma.demandeActivity.create({
    data: {
      demandeId,
      titre: `La demande est ${currentLabel}`,
      typeField: "statusUpdate",
      message: `La demande est passée de ${previousLabel} à ${currentLabel}`,
    },
  });
}

export async function logAffectation(prisma: PrismaClient, demandeId: number, userFullName: string) {
  await prisma.demandeActivity.create({
    data: {
      demandeId,
      titre: `Demande affectée`,
      typeField: "userAssign",
      message: `La demande a été affectée à ${userFullName}`,
    },
  });
}

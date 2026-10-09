import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LocalStorageService } from "src/storage/providers/local/local.storage.service";
import { DocumentServiceBase } from "./base/document.service.base";
import { Prisma, Document as PrismaDocument } from "@prisma/client";
import { startOfDay, endOfDay } from "date-fns";

@Injectable()
export class DocumentService extends DocumentServiceBase {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly localStorageService: LocalStorageService
  ) {
    super(prisma, localStorageService);
  }

  // Precharge typeDocument en une seule requete (evite le N+1 : une requete
  // par document pour son type). Voir demande.service.ts pour le meme pattern.
  async documents(
    args: Prisma.DocumentFindManyArgs
  ): Promise<PrismaDocument[]> {
    return super.documents({
      ...args,
      include: { typeDocument: true },
    });
  }

  // --- Depot public de justificatifs (beneficiaire, sans authentification) ---

  async getDemandeInfoForPublicUpload(demandeId: number) {
    return this.prisma.demande.findUnique({
      where: { id: demandeId },
      select: {
        id: true,
        status: true,
        contact: { select: { id: true, nom: true, prenom: true } },
      },
    });
  }

  // Seuls les types non internes rattaches a la Demande ou au Contact ont
  // un sens pour un beneficiaire (Suivi/Aide sont des usages internes).
  async getTypeDocumentsForPublicUpload() {
    return this.prisma.typeDocument.findMany({
      where: {
        isInternal: false,
        rattachement: { in: ["Contact", "Demande"] },
        publicUploadEnabled: true,
      },
      orderBy: { label: "asc" },
    });
  }

  async getTypeDocumentById(id: number) {
    return this.prisma.typeDocument.findUnique({ where: { id } });
  }

  // Marque un document comme consulte dans l'app (fait disparaitre la
  // pastille "non consulte" des documents deposes par le beneficiaire).
  // Idempotent : ne touche pas a consultedAt si deja renseigne.
  async markConsulted(id: string): Promise<PrismaDocument> {
    const document = await this.prisma.document.findUniqueOrThrow({ where: { id } });
    if (document.consultedAt) return document;
    return this.prisma.document.update({
      where: { id },
      data: { consultedAt: new Date() },
    });
  }

  // Ajoute un evenement dans "Suivi et actions" quand le beneficiaire depose
  // un justificatif depuis la page publique. Regroupe tous les depots de la
  // meme journee dans une seule activite (plutot qu'une activite par
  // fichier) en completant la liste des types deja deposes aujourd'hui.
  async logDepotBeneficiaireActivity(demandeId: number, typeLabel: string): Promise<void> {
    const now = new Date();
    const activiteDuJour = await this.prisma.demandeActivity.findFirst({
      where: {
        demandeId,
        typeField: "docAjoutBeneficiaire",
        createdAt: { gte: startOfDay(now), lte: endOfDay(now) },
      },
    });

    if (activiteDuJour) {
      const labels = [...(activiteDuJour.message?.split(", ").filter(Boolean) ?? []), typeLabel];
      await this.prisma.demandeActivity.update({
        where: { id: activiteDuJour.id },
        data: {
          titre:
            labels.length > 1
              ? `${labels.length} documents déposés par le bénéficiaire`
              : "Document déposé par le bénéficiaire",
          message: labels.join(", "),
        },
      });
    } else {
      await this.prisma.demandeActivity.create({
        data: {
          demandeId,
          typeField: "docAjoutBeneficiaire",
          titre: "Document déposé par le bénéficiaire",
          message: typeLabel,
        },
      });
    }
  }
}

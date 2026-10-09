import * as common from "@nestjs/common";
import type { Response } from "express";
import { Public } from "../decorators/public.decorator";
import { WhatsappService } from "./whatsapp.service";
import { DocumentService } from "../document/document.service";
import { PrismaService } from "../prisma/prisma.service";
import { phoneLastDigits } from "../util/misc";

const STATUTS_DEMANDE_INACTIFS = ["clôturée", "refusée", "Abandonnée"];
const TYPES_MESSAGE_AVEC_MEDIA = ["image", "document", "video"];

@common.Controller("whatsapp")
export class WhatsappController {
  private readonly logger = new common.Logger(WhatsappController.name);

  constructor(
    private readonly whatsappService: WhatsappService,
    private readonly documentService: DocumentService,
    private readonly prisma: PrismaService
  ) {}

  // Poignee de main exigee par Meta a la configuration du webhook : il faut
  // renvoyer tel quel le "hub.challenge" recu, seulement si le token de
  // verification correspond a celui configure dans le dashboard Meta.
  @Public()
  @common.Get("webhook")
  verifyWebhook(
    @common.Query("hub.mode") mode: string,
    @common.Query("hub.verify_token") verifyToken: string,
    @common.Query("hub.challenge") challenge: string,
    @common.Res() res: Response
  ) {
    if (mode === "subscribe" && verifyToken === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
      res.status(200).send(challenge);
    } else {
      res.status(403).send("Verification failed");
    }
  }

  // Reception des messages entrants. Repond toujours 200 rapidement (Meta
  // desactive un webhook qui echoue ou tarde trop a repondre) ; les erreurs
  // de traitement sont seulement loguees.
  @Public()
  @common.Post("webhook")
  async receiveWebhook(@common.Body() payload: any) {
    try {
      const entries = payload?.entry ?? [];
      for (const entry of entries) {
        for (const change of entry.changes ?? []) {
          const messages = change.value?.messages ?? [];
          for (const message of messages) {
            await this.handleIncomingMessage(message);
          }
        }
      }
    } catch (e) {
      this.logger.error(`Erreur traitement webhook WhatsApp : ${(e as Error).message}`);
    }
    return { received: true };
  }

  private async handleIncomingMessage(message: any) {
    if (!TYPES_MESSAGE_AVEC_MEDIA.includes(message?.type)) return;

    const media = message[message.type];
    if (!media?.id) return;

    const from: string = message.from;
    const digits = phoneLastDigits(from);
    if (!digits) return;

    const contact = await this.prisma.contact.findFirst({
      where: { telephone: { contains: digits } },
    });
    if (!contact) {
      this.logger.warn(`Aucun contact trouve pour le numero WhatsApp ${from}`);
      return;
    }

    const demande = await this.prisma.demande.findFirst({
      where: { contactId: contact.id, status: { notIn: STATUTS_DEMANDE_INACTIFS } },
      orderBy: { createdAt: "desc" },
    });

    const { buffer, mimeType } = await this.whatsappService.downloadMedia(media.id);
    const extension = mimeType?.split("/")[1]?.split(";")[0] ?? "bin";
    const filename = `whatsapp-${Date.now()}.${extension}`;

    // Pas de TypeDocument assigne : le fichier arrive "a classer", l'equipe
    // lui attribue le bon type depuis l'application.
    const created = await this.documentService.createDocument({
      data: {
        name: filename,
        contenu: {},
        uploadedByBeneficiaire: true,
        contact: { connect: { id: contact.id } },
        demande: demande ? { connect: { id: demande.id } } : undefined,
      },
    });

    await this.documentService.uploadContenu(
      { where: { id: created.id } },
      { filename, mimetype: mimeType, encoding: "7bit", buffer }
    );

    if (demande) {
      await this.documentService.logDepotBeneficiaireActivity(
        demande.id,
        "Document WhatsApp (à classer)"
      );
    }
  }
}

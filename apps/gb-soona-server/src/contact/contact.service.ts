import { MailService } from 'src/mail/mail.service';
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ContactServiceBase } from "./base/contact.service.base";
import { Prisma, Contact as PrismaContact } from "@prisma/client";
import { buildFullSearch, toWhatsAppPhone } from "src/util/misc";
import { TokenService } from "src/auth/token.service";
import { WhatsappService } from "src/whatsapp/whatsapp.service";
@Injectable()
export class ContactService extends ContactServiceBase {
  constructor(protected readonly prisma: PrismaService,
    protected readonly mailService : MailService,
    private readonly tokenService: TokenService,
    private readonly whatsappService: WhatsappService ) {
    super(prisma);
  }

  // Precharge documents en une seule requete (evite le N+1 : une requete par
  // contact pour ses documents). Meme pattern que demande/document/visite/aide.
  async contacts(args: Prisma.ContactFindManyArgs): Promise<PrismaContact[]> {
    return super.contacts({
      ...args,
      include: { documents: true },
    });
  }

  async createContact(args: Prisma.ContactCreateArgs): Promise<PrismaContact> {
    const contact = await super.createContact(args);
    return this.prisma.contact.update({
      where: { id: contact.id },
      data: { fullSearch: buildFullSearch(contact) },
    });
  }

  async updateContact(args: Prisma.ContactUpdateArgs): Promise<PrismaContact> {
    const contact = await super.updateContact(args);
    return this.prisma.contact.update({
      where: { id: contact.id },
      data: { fullSearch: buildFullSearch(contact) },
    });
  }

  async sendMessage(
    body: string,
    objet: string,
    contactId: number,
    demandeId?: number,
    includeUploadLink?: boolean,
  ) {
    const contact = await this.prisma.contact.findUnique({where:{id:contactId}})
    if (!contact?.email) return;

    let boutonHtml = "";
    if (includeUploadLink && demandeId) {
      const token = await this.tokenService.createTokenForDocumentUpload(demandeId);
      const lien = `${process.env.FRONTEND_URL}/depot-justificatifs?token=${token}`;
      boutonHtml = `
        <div style="margin-top:24px;text-align:center;">
          <a href="${lien}" style="background-color:#2aa8c4;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:bold;display:inline-block;">
            Déposer mes justificatifs en ligne
          </a>
        </div>`;
    }

    const nomComplet = `${contact.prenom ?? ""} ${contact.nom ?? ""}`.trim();
    const bodyAvecVariables = body
      .split("[Nom]").join(nomComplet)
      .split("[bouton_justificatif]").join(boutonHtml);

    await this.mailService.sendHtmlMail(bodyAvecVariables, objet, contact.email, process.env.SMTP_FROM_NAME_EXTERNAL);
  }

  async sendWhatsAppMessage(body: string, contactId: number) {
    const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });
    const to = toWhatsAppPhone(contact?.telephone);
    if (!to) return;

    const nomComplet = `${contact?.prenom ?? ""} ${contact?.nom ?? ""}`.trim();
    const bodyAvecVariables = body.split("[Nom]").join(nomComplet);

    await this.whatsappService.sendTextMessage(to, bodyAvecVariables);
  }
}

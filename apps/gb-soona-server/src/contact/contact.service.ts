import { MailService } from 'src/mail/mail.service';
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ContactServiceBase } from "./base/contact.service.base";
import { Prisma, Contact as PrismaContact } from "@prisma/client";
import { buildFullSearch } from "src/util/misc";
@Injectable()
export class ContactService extends ContactServiceBase {
  constructor(protected readonly prisma: PrismaService,
    protected readonly mailService : MailService ) {
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

  async sendMessage(body: string , objet:string, contactId: number) {
   
    const contact = await this.prisma.contact.findUnique({where:{id:contactId}})
    contact?.email && await this.mailService.sendHtmlMail(body,objet,contact?.email,process.env.SMTP_FROM_NAME_EXTERNAL/* ,false */);
  }
}

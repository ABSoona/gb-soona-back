import { MailService } from 'src/mail/mail.service';
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { ContactServiceBase } from "./base/contact.service.base";
@Injectable()
export class ContactService extends ContactServiceBase {
  constructor(protected readonly prisma: PrismaService,
    protected readonly mailService : MailService ) {
    super(prisma);
  }
  
  async sendMessage(body: string , objet:string, contactId: number) {
   
    const contact = await this.prisma.contact.findUnique({where:{id:contactId}})
    contact?.email && await this.mailService.sendHtmlMail(body,objet,contact?.email,process.env.SMTP_FROM_NAME_EXTERNAL/* ,false */);
  }
}

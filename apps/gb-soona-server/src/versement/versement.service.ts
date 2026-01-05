import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { VersementServiceBase } from "./base/versement.service.base";
import { Prisma, Versement } from "@prisma/client";
import { DemandeService } from "src/demande/demande.service";
import { MailService } from "src/mail/mail.service";


@Injectable()
export class VersementService extends VersementServiceBase {
  constructor(protected readonly prisma: PrismaService,
    protected readonly demandeService: DemandeService,
    private readonly mailService: MailService,
  ) {
    super(prisma);
  }

  async updateVersement(args: Prisma.VersementUpdateArgs): Promise<Versement> {
    const versement= await super.updateVersement(args);
    const aide = await this.prisma.aide.findUnique({where:{id:versement.aideId}});
    const TousVerses = !((await this.prisma.versement.findMany({
      where:{aideId:versement.aideId,status: { in : ["AVerser","Planifie"]}}})).length>0);
    if(TousVerses){
      await this.prisma.aide.update({where:{id:versement.aideId},data:{status:"Expir"}});
      aide?.frequence =="Mensuelle" && await this.notifyAideExpire(aide.id);
      await this.demandeService.updateDemandeWhenExpir(versement.aideId)
    }

    return versement;
  }
  async notifyAideExpire(aideId : number) {
      const notifs = await this.prisma.userNotificationPreference.findMany({
        where: { active: true, typeField: 'AideExpir' },
      });
      
      for (const notif of notifs) {
        const user = await this.prisma.user.findUnique({ where: { id: notif.userId } });
        const aide = await this.prisma.aide.findUnique({
          where: { id: aideId },
          include: {
            demande: {
              select : {
                contact: {
                  select: {
                    nom: true,
                    prenom: true,
                  },
                }
              }
            },
          },
        });
  
        if (user?.email) {
          const lien_demande = `${process.env.FRONTEND_URL}/demandes/${aide?.demandeId}`;
          const beneficiaire = `${aide?.demande?.contact.prenom} ${aide?.demande?.contact.nom}`
          await this.mailService.sendMailAsync(
            'aide-expires',
            user.email,
            { lien_demande, beneficiaire: beneficiaire },
            'Aide mensuelle expirée',
          );
        }
      }
    }
  
  
}

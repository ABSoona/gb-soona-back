
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DemandeServiceBase } from "./base/demande.service.base";
import { Prisma, Demande as PrismaDemande } from "@prisma/client";
import { MailService } from "src/mail/mail.service";

@Injectable()
export class DemandeService extends DemandeServiceBase {
  constructor(protected readonly prisma: PrismaService,
              protected readonly mailService: MailService,
             
             ) {
    super(prisma);
  }

  /**
   * Surcharge de la méthode createDemande pour ajouter des actions personnalisées
   */
  async createDemande(args: Prisma.DemandeCreateArgs): Promise<PrismaDemande> {
    // 1. Appel de la méthode parent générée par Amplication
    const demande = await super.createDemande(args);
     // 2. Envoyer une notification
     const notifs = await this.prisma.userNotificationPreference.findMany({
      where : {
         active : {equals : true},
         typeField : {equals : 'NouvelleDemande'}
        }});
        for (const notif of notifs) {
          const user = await this.prisma.user.findFirst({
            where: { id: notif.userId },
          });
      const lien_demande = `${process.env.FRONTEND_URL}/demandes/${demande.id}`
          if (user?.email) {
           
             this.mailService.sendMailAsync('nouvelle-demande',user.email,{lien_demande},'Nouvelle de demande enregistrée');
          }
        }
 
    
   
  
    // 3. Retourne la demande comme d’habitude
    return demande;
  } 

  async updateDemande(args: Prisma.DemandeUpdateArgs): Promise<PrismaDemande> {
    const current = await this.prisma.demande.findUnique({ where: { id: args.where.id } });
    const demande = await super.updateDemande(args);
  
     const notificationStatusMapping = [
      { notification: 'DemandeEnCommission', label: 'En commission', value: 'en_commision', subject: 'Demande en commission' },
      { notification: 'DemandeEnVisite', label: 'En visite', value: 'en_visite', subject: 'Demande en visite' },
    ] as const;
  
    for (const mapping of notificationStatusMapping) {
      const hasStatusChanged =
        demande.status === mapping.value && current?.status !== mapping.value;
  
      if (hasStatusChanged) {
        const notifs = await this.prisma.userNotificationPreference.findMany({
          where: {
            active: true,
            typeField: mapping.notification,
          },
        });
       
        for (const notif of notifs) {
          const user = await this.prisma.user.findUnique({
            where: { id: notif.userId },
          });
          console.log(user?.email)
          if (user?.email) {
            const lien_demande = `${process.env.FRONTEND_URL}/demandes/${demande.id}`;
            const numeroDemande = demande.id.toString();
            const status = mapping.label;
            
  
            this.mailService.sendMailAsync(
              'demande-status-update',
              user.email,
              { lien_demande, numeroDemande, status },
              mapping.subject
            );
          }
        }
      }
    } 
  
    return demande;
  }
  
  
}

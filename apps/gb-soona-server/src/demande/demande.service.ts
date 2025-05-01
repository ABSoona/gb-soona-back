

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DemandeServiceBase } from "./base/demande.service.base";
import { Prisma, Demande as PrismaDemande } from "@prisma/client";
import { MailService } from "src/mail/mail.service";
import { EnumWebsiteDemandeStatus } from "src/websiteDemande/base/EnumWebsiteDemandeStatus";

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
      where: {
        active: { equals: true },
        typeField: { equals: 'NouvelleDemande' }
      }
    });
    for (const notif of notifs) {
      const user = await this.prisma.user.findFirst({
        where: { id: notif.userId },
      });
      const lien_demande = `${process.env.FRONTEND_URL}/demandes/${demande.id}`
      if (user?.email) {

        this.mailService.sendMailAsync('nouvelle-demande', user.email, { lien_demande }, 'Nouvelle de demande enregistrée');
      }
    }

    const titre = `La demande Reçue`;
    const message = `Message du demandeur : ${demande.remarques}`;
    const demandeActivity = await this.prisma.demandeActivity.create({
      data: {
        demandeId: demande.id,
        titre: titre,
        typeField: 'statusUpdate',
        message: message
      }
    });
    console.log('Nouvelle activité ajoutée:', demandeActivity)

    // 3. Retourne la demande comme d’habitude
    return demande;
  }

  async updateDemande(args: Prisma.DemandeUpdateArgs): Promise<PrismaDemande> {
    const current = await this.prisma.demande.findUnique({ where: { id: args.where.id } });
    const demande = await super.updateDemande(args);

    //add to status history //add demande Activity
    console.log(`Status actuel; ${current?.status}, nouveau status  ${demande?.status}`)
    if (current?.status !== demande.status) {
      console.log('Ajout du historique status')
      demande.status && await this.prisma.demandeStatusHistory.create({ data: { demandeId: demande.id, status: demande.status } });
      console.log('Ajout du actvité ')
      const previousStatusLabel = demandeStatusLabels.find(e => e.value === current?.status)?.label
      const currentStatusLabel = demandeStatusLabels.find(e => e.value === demande?.status)?.label
      const message = `La demande est passé du status  ${previousStatusLabel} au status ${currentStatusLabel}`;
      const titre = `La demande est ${currentStatusLabel}`;
      const demandeActivity = await this.prisma.demandeActivity.create({
        data: {
          demandeId: demande.id,
          titre: titre,
          typeField: 'statusUpdate',
          message: message
        }
      });
      console.log('Nouvelle activité ajoutée:', demandeActivity)
    }


    const notificationStatusMapping = [
      { notification: 'DemandeEnCommission', label: 'En commission', value: 'en_commision', subject: 'Demande en commission' },
      { notification: 'DemandeEnVisite', label: 'En visite', value: 'en_visite', subject: 'Demande en visite' },
    ] as const;

    for (const mapping of notificationStatusMapping) {
      const hasStatusChanged =
        demande.status === mapping.value && current?.status !== mapping.value;

      if (hasStatusChanged) {
        //send mail to users
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

export const demandeStatusLabels = [
  { value: 'recue', label: 'reçue' },
  { value: 'en_visite', label: 'en visite' },
  { value: 'clôturée', label: 'cloturée' },
  { value: 'refusée', label: 'refusée' },
  { value: 'acceptée', label: 'acceptée' },
  { value: 'en_commision', label: 'en commision' },
  { value: 'EnCours', label: 'en cours' },
  { value: 'EnAttente', label: 'en attente' },
  { value: 'Abandonnée', label: 'Abandonnée' },


  
] as const;
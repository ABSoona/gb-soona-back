import { DemandeService } from './../demande/demande.service';
import { MailService } from './../mail/mail.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { Queues } from 'src/bullmq/queues';
import { redisConnection } from 'src/bullmq/queue-dispatcher.config';
import { PrismaService } from 'src/prisma/prisma.service';
import { WebsiteDemande as PrismaWebsiteDemande } from '@prisma/client';
import {

  Contact as PrismaContact,

} from "@prisma/client";

@Injectable()
export class WebSiteDemandeProcessor implements OnModuleInit {
  constructor(private readonly prisma: PrismaService,
    protected readonly demandeService: DemandeService,
    protected readonly mailService: MailService) { }

  onModuleInit() {
    new Worker(
      Queues.DEMANDE,
      async (job: Job) => {
        const args: PrismaWebsiteDemande = job.data;

        try {
          console.log('📨 Job : Création de la demande et du contact depuis le site internet');
          await this.prisma.websiteDemande.update({
            where: { id: args.id },
            data: {
              status: 'EnCours',
              erreur: '',
            },
          });

          const contact = await this.findOrCreateContact(args);
          if (contact) {
            await this.createDemande(args, contact)
          }

          // Met à jour la demande avec l’erreur
          await this.prisma.websiteDemande.update({
            where: { id: args.id },
            data: {
              status: 'Trait',
              erreur: '',
            },
          });


          console.log('🎯 Contact final utilisé :', contact);
          console.log('✅ Job terminé avec succès');
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Erreur inconnue lors du traitement de la demande site internet';
          console.error('Erreur lors du traitement de la demande site internet :', errorMessage);
          this.sendMailerror(errorMessage);
          // Met à jour la demande avec l’erreur
          await this.prisma.websiteDemande.update({
            where: { id: args.id },
            data: {
              status: 'EnErreur',
              erreur: errorMessage,
            },
          });

          throw error;
        }
      },
      {
        connection: redisConnection,
      },
    );
  }

  private async findOrCreateContact(args: PrismaWebsiteDemande) {
    const prisma = this.prisma;

    const strategies = [
      {
        label: 'nom, prénom et âge',
        where: {
          nom: { equals: args.nomDemandeur },
          prenom: { equals: args.prenomDemandeur },
          age: { equals: args.ageDemandeur },
        },
      },
      {
        label: 'téléphone',
        where: args.telephoneDemandeur
          ? { telephone: { equals: args.telephoneDemandeur } }
          : null,
      },
      {
        label: 'email',
        where: args.emailDemandeur
          ? { email: { equals: args.emailDemandeur } }
          : null,
      },
    ];

    for (const strategy of strategies) {
      if (!strategy.where) continue;

      const contacts = await prisma.contact.findMany({ where: strategy.where });

      if (contacts.length > 1) {
        throw new Error(`Plusieurs contacts trouvés avec le même ${strategy.label}`);
      }

      if (contacts.length === 1) {
        if (contacts[0].status === 'blacklisté') {
          
          if(contacts[0]?.email){
            const contact_name = contacts[0].prenom?contacts[0].prenom:'Assalamou Alaykoum'
            this.mailService.sendMailAsync('contact-blacklist',contacts[0]?.email,{contact_name},'Suite à votre demande sur soona.fr')
          }
          
          throw new Error(`Contact Blacklisté, aucune demande ne sera créée`);
        }
        else {
          return contacts[0];
        }

      }
    }

    // Aucun contact trouvé : on le crée
    return await this.prisma.contact.create({
      data: {
        nom: args.nomDemandeur,
        prenom: args.prenomDemandeur,
        age: args.ageDemandeur,
        telephone: args.telephoneDemandeur,
        email: args.emailDemandeur,
        adresse: args.adresseDemandeur,
        codePostal: args.codePostalDemandeur,
        ville: args.villeDemandeur,
        remarques: args.remarques,
        status: 'active'
      },
    });

  }
  private async createDemande(args: PrismaWebsiteDemande, contact: PrismaContact) {

    const demande = await this.demandeService.createDemande({
      data: {
        contact: {
          connect: { id: contact.id },
        },
        situationProfessionnelle: args.situationProfessionnelle,
        situationFamiliale: args.situationFamiliale,
        revenus: args.revenus,
        revenusConjoint: args.revenusConjoint,
        nombreEnfants: args.nombreEnfants,
        agesEnfants: args.agesEnfants,
        situationProConjoint: args.situationProConjoint,
        autresAides: args.autresAides,
        autresCharges: args.autresCharges,
        apl: args.apl,
        dettes: args.dettes,
        natureDettes: args.natureDettes,
        facturesEnergie: args.facturesEnergie,
        remarques: args.remarques,
        status: 'recue'
      },
    });
  }

  private async sendMailerror(errorMessage: string) {
    const notifs = await this.prisma.userNotificationPreference.findMany({
      where: {
        active: { equals: true },
        typeField: { equals: 'ErreursDemandes' }
      }
    });
    for (const notif of notifs) {
      const user = await this.prisma.user.findFirst({
        where: { id: notif.userId },
      });
      const lien_demande = `${process.env.FRONTEND_URL}/website-demandes`
      const error_message = errorMessage
      if (user?.email) {

        this.mailService.sendMailAsync('website-demande-error', user.email, { lien_demande, error_message }, 'Une demande depuis le site internet et bloquée');
      }
    }

  }
}

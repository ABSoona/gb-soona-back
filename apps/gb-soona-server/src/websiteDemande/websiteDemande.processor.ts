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
import { WebsiteDemandeNotificationService } from './website-demande-notification.service';

@Injectable()
export class WebSiteDemandeProcessor implements OnModuleInit {
  constructor(private readonly prisma: PrismaService,
    protected readonly demandeService: DemandeService,
    protected readonly mailService: MailService,
    protected readonly websiteDemandeNotificationService:WebsiteDemandeNotificationService
  ) { }

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
          await this.websiteDemandeNotificationService.notifyError(errorMessage);
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
            await this.websiteDemandeNotificationService.notifyBlacklistContact(contacts[0].email, contacts[0]?.prenom);
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
    const defaultActeur = await this.prisma.user.findFirst({where:{role:"assistant_social"}})
    const adminUser =  await this.prisma.user.findFirst({where:{role:"admin"}})
    const demande = await this.demandeService.createDemande({
      data: {
        contact: {
          connect: { id: contact.id },
        },
        situationProfessionnelle: args.situationProfessionnelle && mapSituationProfessionnelle(args.situationProfessionnelle),
        situationFamiliale: args.situationFamiliale && mapSituationFamiliale(args.situationFamiliale),
        revenus: args.revenus,
        revenusConjoint: args.revenusConjoint,
        nombreEnfants: args.nombreEnfants,
        agesEnfants: args.agesEnfants,
        situationProConjoint: args.situationProConjoint && mapSituationProfessionnelle(args.situationProConjoint),
        autresAides: args.autresAides,
        autresCharges: args.autresCharges,
        apl: args.apl,
        dettes: args.dettes,
        loyer:  args.loyer,
        natureDettes: args.natureDettes,
        facturesEnergie: args.facturesEnergie,
        remarques: args.remarques,
        status: 'recue',
        acteur:defaultActeur? {connect:{id:defaultActeur?.id}}:{connect:{id:adminUser?.id}},
        proprietaire : {connect:{id:defaultActeur?.id}}
      },
    });
  }


  
}
function mapSituationFamiliale(value: string): string {
  const mappings: Record<string, string> = {
    'Marié(e)': 'marié',
    'Célibataire': 'célibataire',
    'Divorcé(e)': 'divorcé',
    'Veuf(ve)': 'veuf',
  };
  return mappings[value] ?? value.toLowerCase();
}

function mapSituationProfessionnelle(value: string): string {
  const mappings: Record<string, string> = {
    'Sans emploi': 'sans_emploi',
    'Salarié(e)': 'employé',
    'Travailleur indépendant': 'indépendant',
    'Retraité(e)': 'retraité',
  };
  return mappings[value] ?? value.toLowerCase();
}

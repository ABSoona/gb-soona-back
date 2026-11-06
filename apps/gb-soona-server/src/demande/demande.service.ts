import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DemandeServiceBase } from "./base/demande.service.base";
import { Aide, Prisma, Demande as PrismaDemande } from "@prisma/client";
import { MailService } from "src/mail/mail.service";

import { DemandeNotificationService } from "./demande-notification.service";

import { generateDemandePdf } from "./demande-pdf.helper";

import { Response } from 'express';
import { TokenService } from "src/auth/token.service";
import * as common from "@nestjs/common";
import { logAffectation, logStatusChange } from "./demande-activity.helper";
import { buildFullSearch } from "src/util/misc";
import { OrganizationSettingsService } from "src/organizationSettings/organizationSettings.service";

const STATUT_EN_COMITE = "en_commision";

// Valeur d'un champ apres application de `data` : la nouvelle valeur si le
// champ est fourni dans la mise a jour (forme simple ou { set }), sinon la
// valeur actuelle. Comme pour Prisma, `undefined` signifie "pas de
// changement" : les inputs GraphQL (classes compilees en ES2022) portent
// tous leurs champs, a undefined quand le front ne les envoie pas.
function valeurApresMaj<T>(data: Record<string, any>, champ: string, actuelle: T): T {
  const valeur = data[champ];
  if (valeur === undefined) return actuelle;
  return valeur !== null && typeof valeur === "object" && "set" in valeur ? valeur.set : valeur;
}

// Code postal francais : 5 chiffres, stocke en Int (le zero de tete des
// departements 01 a 09 est donc perdu, d'ou la borne basse a 1000).
function codePostalValide(codePostal: number | null | undefined): boolean {
  return Number.isInteger(codePostal) && codePostal! >= 1000 && codePostal! <= 98999;
}

@Injectable()
export class DemandeService extends DemandeServiceBase {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly mailService: MailService,
    private readonly notificationService: DemandeNotificationService,
    protected readonly tokenService: TokenService,
    private readonly organizationSettingsService: OrganizationSettingsService,
  ) {
    super(prisma);
  }

  // Precharge en une seule requete les relations systematiquement demandees
  // par le frontend (contact+aides, demandeActivities+user, acteur) pour
  // eviter le N+1 (une requete par ligne et par relation) sur la liste des
  // demandes. Les resolvers getContact/getActeur/findDemandeActivities du
  // resolver utilisent ces donnees deja chargees quand elles sont presentes.
  async demandes(args: Prisma.DemandeFindManyArgs): Promise<PrismaDemande[]> {
    return super.demandes({
      ...args,
      include: {
        contact: { include: { aides: true } },
        demandeActivities: {
          orderBy: { createdAt: 'desc' },
          include: { user: true },
        },
        acteur: true,
      },
    });
  }

  async createDemande(args: Prisma.DemandeCreateArgs): Promise<PrismaDemande> {
    const demande = await super.createDemande(args);

    await this.notificationService.notifyNewDemande(demande.id, demande.remarques ?? '');

    await this.prisma.demandeActivity.create({
      data: {
        demandeId: demande.id,
        titre: 'Demande Reçue',
        typeField: 'statusUpdate',
        message: `Message du demandeur : ${demande.remarques}`,
      },
    });

    return demande;
  }

  async updateDemande(args: Prisma.DemandeUpdateArgs): Promise<PrismaDemande> {
    // 1️⃣ On récupère la demande actuelle AVANT mise à jour
    const current = await this.prisma.demande.findUnique({
      where: { id: args.where.id },
      include: { contact: true }, // important pour comparar contactId
    });

    const nouveauStatut = valeurApresMaj(args.data, "status", current?.status);
    if (current && nouveauStatut === STATUT_EN_COMITE && current.status !== STATUT_EN_COMITE) {
      await this.verifierPretPourComite(current, args.data);
    }

    let fullSearch: string | undefined = undefined;

    let contactId: number | undefined = undefined;
    
    // Si le contact est remplacé par un nouveau :
    if (args.data.contact?.connect?.id) {
      contactId = args.data.contact.connect.id;
    }
    
    // Si le contact est modifié, on garde l’ID actuel :
    else if (args.data.contact?.update) {
      contactId = current?.contactId;
    }
    
    // Si un contactId est défini, on recalcule fullSearch :
    if (contactId) {
      const updatedContact = await this.prisma.contact.findUnique({
        where: { id: contactId },
      });
    
      if (updatedContact) {
        fullSearch = buildFullSearch(updatedContact);
      }
    }
  
    // 3️⃣ On applique les changements (avec fullSearch si nécessaire)
    const demande = await super.updateDemande({
      ...args,
      data: {
        ...args.data,
        ...(fullSearch !== undefined && { fullSearch }),
      },
    });
  
    if (demande.status && current?.status && current?.status !== demande.status) {
      await logStatusChange(this.prisma, current.status, demande.status, demande.id);
      
      await this.notificationService.notifyStatusChange(demande.id, current.status, demande.status);
    }
  
    if (demande.acteurId && demande.acteurId !== current?.acteurId) {
      const user = await this.prisma.user.findUnique({ where: { id: demande.acteurId } });
      if (user) {
        await logAffectation(this.prisma, demande.id, `${user.firstName} ${user.lastName}`);
        await this.notificationService.notifyAssignment(demande.id, user.id);
      }
    }
  
    return demande;
  }

  // Controle avant passage "En comite", quel que soit le chemin (action
  // "Soumettre au comite", changement de statut dans le volet de
  // modification, passage auto apres visite) : le dossier doit etre complet.
  // Les valeurs controlees sont celles APRES la mise a jour, pour qu'on
  // puisse completer la demande et changer le statut en un seul
  // enregistrement.
  private async verifierPretPourComite(
    current: PrismaDemande,
    data: Prisma.DemandeUpdateArgs["data"],
  ): Promise<void> {
    const manquants: string[] = [];

    const contactId = (data.contact as any)?.connect?.id ?? current.contactId;
    const contact = await this.prisma.contact.findUnique({ where: { id: contactId } });

    if (!codePostalValide(contact?.codePostal)) {
      manquants.push("le code postal du bénéficiaire (5 chiffres)");
    }
    if (!contact?.dateNaissance || contact.dateNaissance > new Date()) {
      manquants.push("la date de naissance du bénéficiaire");
    }
    if (!valeurApresMaj(data, "categorieDemandeur", current.categorieDemandeur)) {
      manquants.push("la catégorie du demandeur");
    }
    const nombrePersonnes = valeurApresMaj(data, "nombrePersonnes", current.nombrePersonnes);
    if (!nombrePersonnes || nombrePersonnes < 1) {
      manquants.push("le nombre de personnes dans le foyer");
    }

    const settings = await this.organizationSettingsService.get();
    if (settings.exigerVisitesRealiseesComite) {
      const visites = await this.prisma.visite.findMany({
        where: { demandeId: current.id },
        select: { status: true },
      });
      // Les visites annulees ne comptent ni comme visite creee, ni comme
      // visite restant a realiser.
      const visitesActives = visites.filter((v) => v.status !== "Annulee");
      const visitesNonRealisees = visitesActives.filter((v) => v.status !== "Realisee").length;
      if (visitesActives.length === 0) {
        manquants.push("au moins une visite (aucune visite créée pour cette demande)");
      } else if (visitesNonRealisees > 0) {
        manquants.push(
          visitesNonRealisees > 1
            ? `les ${visitesNonRealisees} visites rattachées, qui doivent être réalisées`
            : "la visite rattachée, qui doit être réalisée",
        );
      }
    }

    if (manquants.length > 0) {
      throw new common.BadRequestException(
        `La demande ne peut pas passer en comité. Merci de compléter : ${manquants.join(", ")}.`,
      );
    }
  }

  async share(data: { demandeId: number, userId: string, subordoneId: string }): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: data.userId } })

    const subordonne = await this.prisma.user.findUnique({ where: { id: data.subordoneId } })
    const demande = await this.prisma.demande.findUnique({ where: { id: data.demandeId } })
    const contact = await this.prisma.contact.findUnique({ where: { id: demande?.contactId } })
    console.log(subordonne, demande, contact)
    const token = await this.tokenService.createTokenForShare(data.userId);
    await this.prisma.user.update({ where: { id: user?.id }, data: { token: token } })
     //const template = (subordonne?.id===user?.id )?"visite-affecte-membre":"visite-affecte-benevole"
    user?.email && await this.mailService.sendMailAsync("partage-demande", user?.email, {
      nomUser: user?.firstName ? user?.firstName : "",
      nomBenevole: `${subordonne?.firstName} ${subordonne?.lastName}`,
      departement: `${contact?.ville} (${contact?.codePostal})`,
      NumeroDemande:data.demandeId.toString(),
      lien_pdf: `${process.env.FRONTEND_URL}/demandes/${data.demandeId}/fiche-visite-pdf?token=${token}`

    }, "Une demande vous a été partagé");
  }
  
  async donwloadDemande(demandeId: number, token: string, res: Response): Promise<void> {
    const demande = await this.prisma.demande.findUnique({ where: { id: Number(demandeId) } });
    const contact = await this.prisma.contact.findUnique({ where: { id: Number(demande?.contactId) } });

    if (!demande) {
      throw new common.NotFoundException(`Demande ${demandeId} introuvable`);
    }
    if (!contact) {
      throw new common.InternalServerErrorException(`Contact  introuvable`);
    }

    const userId = await this.tokenService.decodeJwtToken(token)
    console.log(userId)
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (user?.token === token) {
      return await generateDemandePdf(demande, contact, res);
    } else {
      throw new common.BadRequestException(`invalid token`);
    }
  }

  async donwloadAuthDemande(demandeId: number, res: Response): Promise<void> {
    const demande = await this.prisma.demande.findUnique({ where: { id: Number(demandeId) } });
    const contact = await this.prisma.contact.findUnique({ where: { id: Number(demande?.contactId) } });

    if (!demande) {
      throw new common.NotFoundException(`Demande ${demandeId} introuvable`);
    }
    if (!contact) {
      throw new common.InternalServerErrorException(`Contact  introuvable`);
    }
    return await generateDemandePdf(demande, contact, res);
   
  }

   async updateDemandeWhenExpir(aideId:number){
    const aide = await this.prisma.aide.findUnique({where: {id:aideId}})
      const newDemandeStatus = aide?.reetudier ? 'en_commision':'clôturée'
      aide?.demandeId && await this.prisma.demande.update({where:{id:aide?.demandeId},data:{status:newDemandeStatus}})
  
    }
 
}

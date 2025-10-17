import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { VisiteServiceBase } from "./base/visite.service.base";
import { Prisma, Visite } from "@prisma/client";
import { MailService } from "src/mail/mail.service";
import { TokenService } from "src/auth/token.service";
import { DemandeActivityService } from "src/demandeActivity/demandeActivity.service";

@Injectable()
export class VisiteService extends VisiteServiceBase {
  constructor(protected readonly prisma: PrismaService,
    protected readonly mailService: MailService,
    protected readonly tokenService: TokenService,

  ) {
    super(prisma);
  }

  async createVisite(args: Prisma.VisiteCreateArgs): Promise<Visite> {

    const visite = await super.createVisite(args);
    const acteur = await this.prisma.user.findUnique({ where: { id: visite.acteurId }, include: { superieur: true } })
    const demande = await this.prisma.demande.findUnique({ where: { id: args.data.demande?.connect?.id }, include: { contact: true } })
    const token = await this.tokenService.createTokenForPasswordReset(visite.acteurId);
    await this.prisma.user.update({ where: { id: visite.acteurId }, data: { token: token } })

    /////////////////////envoie du mail au visiteur
    acteur?.email && await this.mailService.sendMailAsync('visite-affecte-membre', acteur?.email, {
      nomUser: acteur?.firstName ? acteur?.firstName : "",
      departement: `${demande?.contact?.ville} (${demande?.contact?.codePostal})`,
      lien_pdf: `${process.env.FRONTEND_URL}/demandes/${demande?.id}/fiche-visite-pdf?token=${token}`

    }, "Nouvelle visite");

    /////////////////////Si le visiteur a un superieur prevenir son superieur
    (acteur?.superieur?.email) && await this.mailService.sendMailAsync('visite-affecte-benevole', acteur?.superieur?.email, {
      nomUser:acteur?.superieur.firstName ?? "",
      nomBenevole: `${acteur?.firstName} ${acteur?.lastName}`,
      departement: `${demande?.contact?.ville} (${demande?.contact?.codePostal})`,
      lien_pdf: `${process.env.FRONTEND_URL}/demandes/${demande?.id}/fiche-visite-pdf?token=${token}`

    }, `Nouvelle visite pour ${acteur?.firstName}`);

    ///////////////////// Log de l'activité
    const titre = "Visite attribuée"
    const message = `${acteur?.firstName} ${acteur?.lastName} a été désigné pour realiser la visite
    ${acteur?.superieur?`, en coordination avec ${acteur?.superieur.firstName} ${acteur?.superieur.lastName}`:''}`
    demande && await this.prisma.demandeActivity.create({ data: { titre: titre, message: message, typeField: 'visite', demande: { connect: { id: demande.id } } } })

    return visite;
  }

  
  async updateVisite(args: Prisma.VisiteUpdateArgs): Promise<Visite> {
    const originalVisite= await this.prisma.visite.findUnique({where:{id:args.where.id}})
    const visite = await super.updateVisite(args);
    const acteur = await this.prisma.user.findUnique({ where: { id: visite.acteurId }, include: { superieur: true } })
    const demande = await this.prisma.demande.findUnique({ where: { id: visite.demandeId}, include: { contact: true } })
    if(originalVisite?.dateVisite != args.data.dateVisite && args.data.dateVisite != null){
      const titre = "Visite planifiée"
      const message = `La visite attribuée à ${acteur?.firstName} ${acteur?.lastName} a été planifiée au ${visite.dateVisite && new Date(visite.dateVisite).toLocaleDateString()}`
       demande && await this.prisma.demandeActivity.create({ data: { titre: titre, message: message, typeField: 'visite', demande: { connect: { id: demande.id } } } })
    }
    if(args.data.status==='Annulee' &&  args.data.status != originalVisite?.status){
      const titre = "Visite annulée"
      const message = `La visite attribuée à ${acteur?.firstName} ${acteur?.lastName} a été annulée`
       demande && await this.prisma.demandeActivity.create({ data: { titre: titre, message: message, typeField: 'visite', demande: { connect: { id: demande.id } } } })
    }
    return visite;

  }
}

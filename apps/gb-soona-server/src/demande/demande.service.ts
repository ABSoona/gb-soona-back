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

@Injectable()
export class DemandeService extends DemandeServiceBase {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly mailService: MailService,
    private readonly notificationService: DemandeNotificationService,
    protected readonly tokenService: TokenService,
  ) {
    super(prisma);
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
    const current = await this.prisma.demande.findUnique({ where: { id: args.where.id } });
    const demande = await super.updateDemande(args);
  
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

  async share(data: { demandeId: number, userId: string, subordoneId: string }): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { id: data.userId } })

    const subordonne = await this.prisma.user.findUnique({ where: { id: data.subordoneId } })
    const demande = await this.prisma.demande.findUnique({ where: { id: data.demandeId } })
    const contact = await this.prisma.contact.findUnique({ where: { id: demande?.contactId } })
    console.log(subordonne, demande, contact)
    const token = await this.tokenService.createTokenForPasswordReset(data.userId);
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
  
  async donwloadFicheVisite(demandeId: number, token: string, res: Response): Promise<void> {
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
      return generateDemandePdf(demande, contact, res);
    } else {
      throw new common.BadRequestException(`invalid token`);
    }
  }

   async updateDemandeWhenExpir(aideId:number){
    const aide = await this.prisma.aide.findUnique({where: {id:aideId}})
      const newDemandeStatus = aide?.reetudier ? 'en_commision':'clôturée'
      aide?.demandeId && await this.prisma.demande.update({where:{id:aide?.demandeId},data:{status:newDemandeStatus}})
  
    }
 
}

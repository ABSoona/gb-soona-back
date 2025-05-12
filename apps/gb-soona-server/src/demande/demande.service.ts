import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DemandeServiceBase } from "./base/demande.service.base";
import { Prisma, Demande as PrismaDemande } from "@prisma/client";
import { MailService } from "src/mail/mail.service";
import { EnumWebsiteDemandeStatus } from "src/websiteDemande/base/EnumWebsiteDemandeStatus";
import { DemandeNotificationService } from "./demande-notification.service";
import { demandeStatusLabels } from "./demande.data";
const PDFDocument = require('pdfkit');
import { Response } from 'express';
import { Demande } from "./base/Demande";
import { Contact } from "src/contact/base/Contact";
import { capitalizeFirstLetter } from "src/util/misc";
import { TokenService } from "src/auth/token.service";
import * as common from "@nestjs/common";

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

    if (demande.status && current?.status !== demande.status) {
      await this.prisma.demandeStatusHistory.create({
        data: { demandeId: demande.id, status: demande.status },
      });

      const previousLabel = demandeStatusLabels.find(e => e.value === current?.status)?.label;
      const currentLabel = demandeStatusLabels.find(e => e.value === demande.status)?.label;

      await this.prisma.demandeActivity.create({
        data: {
          demandeId: demande.id,
          titre: `La demande est ${currentLabel}`,
          typeField: 'statusUpdate',
          message: `La demande est passée de ${previousLabel} à ${currentLabel}`,
        },
      });
      // assiged user has change, add activity and send notification
      
      current?.status && await this.notificationService.notifyStatusChange(demande.id, current.status, demande.status);
    }
    console.log(demande.acteurId,current?.acteurId)
      if(demande.acteurId !== current?.acteurId){
        const user = demande.acteurId?await this.prisma.user.findUnique({where:{id:demande.acteurId}}):undefined
        await this.prisma.demandeActivity.create({
          data: {
            demandeId: demande.id,
            titre: `Demande effectée`,
            typeField: 'userAssign',
            message: `La demande a été affectée à ${user?.firstName} ${user?.lastName}`,
          },
        });
        user?.id && await this.notificationService.notifyAssignment(demande.id, user.id);
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
     const template = (subordonne?.id===user?.id )?"visite-affecte-membre":"visite-affecte-benevole"
    user?.email && await this.mailService.sendMailAsync(template, user?.email, {
      nomUser: user?.firstName ? user?.firstName : "",
      nomBenevole: `${subordonne?.firstName} ${subordonne?.lastName}`,
      departement: `${contact?.ville} (${contact?.codePostal})`,
      lien_pdf: `${process.env.FRONTEND_URL}/demandes/${data.demandeId}/fiche-visite-pdf?token=${token}`

    }, "Fiche de visite");
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
      return this.generateDemandePdf(demande, contact, res);
    } else {
      throw new common.BadRequestException(`invalid token`);
    }



  }

  private renderSectionTitle(doc: PDFKit.PDFDocument, title: string) {
    const y = doc.y;
    const height = 20;

    doc
      .fillColor('#4B5563')
      .rect(50, y, 500, height)
      .fill();

    doc
      .fillColor('#FFFFFF')
      .fontSize(14)
      .font('Helvetica-Bold')
      .text(title, 55, y + 5);

    doc.moveDown(1);
  }

  private renderLigneAvecObservation(doc: PDFKit.PDFDocument, label?: string, value?: string, observations?:boolean,type?: string) {


    const xLabel = 50;
    const xObservation = 320;
    const maxWidth = 250;

    const labelText = label ? `${label} :` : '';
    const valueText = type === "montant" ? `${value} €` : value;
    const observationText = label && observations? 'Observation : ' : '';

    // Mesurer la hauteur du bloc gauche
    const leftTextHeight = doc.heightOfString(`${labelText} ${valueText}`, { width: maxWidth });

    const y = doc.y;

    // Texte gauche (label en gras, valeur normale)
    doc.font('Helvetica-Bold').fontSize(11).fillColor('#000');
    doc.text(labelText, xLabel, y, { continued: true });

    doc.font('Helvetica').text(` ${valueText}`, { width: maxWidth });

    // Observation à droite
    doc.font('Helvetica-Oblique').fillColor('#888');
    doc.text(observationText, xObservation, y, { width: maxWidth });

    doc.y = y + leftTextHeight + 4; // Avancer proprement
  }


  generateDemandePdf(demande: Demande, contact: Contact, res: Response) {
    const doc = new PDFDocument({ margin: 50, bufferPages: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=demande-${demande.id}.pdf`);
    doc.pipe(res);

    doc.fontSize(22).fillColor('#2563EB').text(`Fiche de visite - Demande N° ${demande.id}`, { align: 'center' }).moveDown(1.5);

    this.renderSectionTitle(doc, '1. Identité et contact');
    this.renderLigneAvecObservation(doc, 'Numéro bénéficiaire', contact.id?.toString() ?? '—',false);
    this.renderLigneAvecObservation(doc, 'Nom', capitalizeFirstLetter(contact.nom),false);
    this.renderLigneAvecObservation(doc, 'Prénom', capitalizeFirstLetter(contact.prenom),false);
    this.renderLigneAvecObservation(doc, 'Âge', contact.age?.toString() ?? '—',false);
    this.renderLigneAvecObservation(doc, 'Adresse', `${contact.adresse ?? ''} `,false);
    this.renderLigneAvecObservation(doc, undefined, `${contact.codePostal ?? ''} ${contact.ville ?? ''}`,false);
    this.renderLigneAvecObservation(doc, 'Téléphone', contact.telephone ?? '—',false);
    this.renderLigneAvecObservation(doc, 'E-mail', contact.email ?? '—',false);

    
    this.renderSectionTitle(doc, '3. Situation du foyer');
    this.renderLigneAvecObservation(doc, 'Situation familiale', capitalizeFirstLetter(demande.situationFamiliale),false);
    this.renderLigneAvecObservation(doc, 'Situation professionnelle', capitalizeFirstLetter(demande.situationProfessionnelle),false);
    if (demande.situationProConjoint)
      this.renderLigneAvecObservation(doc, 'Situation pro. du conjoint', capitalizeFirstLetter(demande.situationProConjoint),false);
    if (demande.nombreEnfants && demande.nombreEnfants > 0)
      this.renderLigneAvecObservation(doc, "Nombre d'enfants", demande.nombreEnfants.toString(),false);
    if (demande.agesEnfants)
      this.renderLigneAvecObservation(doc, 'Âges des enfants', demande.agesEnfants,false);

    this.renderSectionTitle(doc, '4. Charges');


    this.renderLigneAvecObservation(doc, 'Autres charges', demande.autresCharges?.toString() ?? '—',false, "montant");
    this.renderLigneAvecObservation(doc, 'Dettes', demande.dettes?.toString() ?? '—', false,"montant");
    this.renderLigneAvecObservation(doc, 'Nature des dettes', demande.natureDettes ?? '—',false);
    this.renderLigneAvecObservation(doc, 'Loyer', demande.loyer?.toString() ?? '—', false,"montant");
    this.renderLigneAvecObservation(doc, 'Factures énergie', demande.facturesEnergie?.toString() ?? '—', false,"montant");

    this.renderSectionTitle(doc, '5. Revenus');
    this.renderLigneAvecObservation(doc, 'APL', demande.apl?.toString() ?? '—', false,"montant");
    this.renderLigneAvecObservation(doc, 'Revenus', demande.revenus?.toString() ?? '—', false,"montant");
    this.renderLigneAvecObservation(doc, 'Revenus conjoint', demande.revenusConjoint?.toString() ?? '—', false,"montant");
    this.renderLigneAvecObservation(doc, 'Autres aides', demande.autresAides ?? '—', false,"montant");




    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(10).fillColor('#999').text(`Page ${i + 1} / ${range.count}`, 500, 770);
    }

    doc.end();
  }
}

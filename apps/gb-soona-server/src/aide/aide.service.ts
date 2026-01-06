import { Int } from '@nestjs/graphql';
import { NotFoundException } from './../errors';
import { DemandeService } from './../demande/demande.service';
import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AideServiceBase } from "./base/aide.service.base";
import { Aide, Prisma, Aide as PrismaAide } from "@prisma/client";
import { EnumAideTypeField } from "./base/EnumAideTypeField";
import { EnumAideFrequence } from './base/EnumAideFrequence';
import * as common from "@nestjs/common";
import { Versement } from 'src/versement/base/Versement';
import { VersementCreateInput } from 'src/versement/base/VersementCreateInput';
import { EnumVersementStatus } from 'src/versement/base/EnumVersementStatus';
import { addMonths } from 'date-fns';
import { generateAideActivityMessage, generateAideSuspendActivityMessage as generateAideSuspendActivityMessage, generateVersements } from './aide.logic';
import { MailService } from 'src/mail/mail.service';



@Injectable()
export class AideService extends AideServiceBase {
  constructor(protected readonly prisma: PrismaService,
    protected readonly demandeService: DemandeService,
    protected readonly mailService: MailService

    ) {
    super(prisma);
  }

  async createAide(args: Prisma.AideCreateArgs): Promise<PrismaAide> {
   
    const aide = await super.createAide(args);
    const contact = await this.prisma.contact.findUnique({where : {id:aide.contactId}})
    await this.createRelatedVersement(aide);
    await this.addCreateActivity(aide);
    aide.demandeId && await this.demandeService.updateDemande({
      data: { telegramComiteeAction: false},
      where: { id: aide.demandeId },
    });

    if(aide.acteurVersementId==null)
      return aide;
    
    const user = await this.prisma.user.findUnique({ where: { id: aide.acteurVersementId} });
    if (user?.email && user.hasAccess) {
      const lien_versement = `${process.env.FRONTEND_URL}/versements`;
      await this.mailService.sendMailAsync(
        'affectation-aide',
        user.email,
        {
          lien_versement,
          beneficiaire: `${contact?.prenom} ${contact?.nom}` ,
          montant :`${aide.montant?.toLocaleString()}€`,
          nombreVersements : `${aide.nombreVersements}`,
          dateAide : `${aide.dateAide?.toLocaleDateString()}`,
          demandeId :`${aide.demandeId}`
         
        },
        "Vous avez été chargé du versement d'une aide",
      );
  }

    return aide;
  }

  async updateAide(args: Prisma.AideUpdateArgs): Promise<PrismaAide> {
    const aideId = args.where?.id;
  if (typeof aideId !== "number") {
    throw new Error("updateAide: args.where.id manquant ou invalide");
  }
    const  newStatus= args.data.status;
    const currentAide = await this.prisma.aide.findUnique({where : {id :aideId }, include:{contact:true}})
    const aide = await super.updateAide(args);
    
    if ((currentAide?.nombreVersements != args.data.nombreVersements && args.data.nombreVersements != null) ||
        (currentAide?.dateAide !=args.data.dateAide && args.data.dateAide != null) ||
        (currentAide?.frequence !=args.data.frequence && args.data.frequence != null)
       ){
      const versement = await this.prisma.versement.deleteMany({where:{aideId :{equals:aide.id},status:{equals:'AVerser'}}})
      await this.createRelatedVersement(aide);
    }
    else {
      if (aide.montant != null ){
        await this.prisma.versement.updateMany({where:{ aideId: aideId}, data:{
          montant : aide.montant,
        }
        })
      }
        
    }
    
    //todo : await this.addUpdateActivity(aide);
    if(newStatus == 'EnCours' && aide.status=='Expir'){
      await this.demandeService.updateDemandeWhenExpir(aide.id);
      console.log("Envoi du mail de notification expiration aide")
     
    }
    if(newStatus == 'EnCours' && aide.suspendue){
    await this.addSuspendActivity(aide)
    }

    //envoi de la notification au tresorier
    if(currentAide?.acteurVersementId !== aide.acteurVersementId)
    {
      if (aide.acteurVersementId==undefined) {
        throw new Error("updateAide: args.where.id manquant ou invalide");
      }
      
      const user = await this.prisma.user.findUnique({ where: { id: aide.acteurVersementId} });
      if (user?.email && user.hasAccess) {
        const lien_versement = `${process.env.FRONTEND_URL}/versements`;
        await this.mailService.sendMailAsync(
          'affectation-aide',
          user.email,
          {
            lien_versement,
            beneficiaire: `${currentAide?.contact.prenom} ${currentAide?.contact.nom}` ,
            montant :`${aide.montant?.toLocaleString()}€`,
            nombreVersements : `${aide.nombreVersements}`,
            dateAide : `${aide.dateAide?.toLocaleDateString()}`,
            demandeId :`${aide.demandeId}`
           
          },
          "Vous avez été chargé du versement d'une aide",
        );
    }
    }
    
    return aide;
  }

  
  
  async createRelatedVersement(newAide: Aide) {
    const versements = generateVersements(newAide);
    await this.prisma.versement.createMany({ data: versements });
    return versements;
  }
  
  async addCreateActivity(aide: Aide) {
    if (aide.demandeId) {
      const titre = "Aide accordée";
      const message = generateAideActivityMessage(aide);
  
      await this.prisma.demandeActivity.create({
        data: {
          demandeId: aide.demandeId,
          aideId: aide.id,
          titre,
          typeField: "aideAdd",
          message,
        },
      });
  
      await this.demandeService.updateDemande({
        data: { status: "EnCours" },
        where: { id: aide.demandeId },
      });
    }
  }
  async addSuspendActivity(aide: Aide) {
    if (aide.demandeId) {
      const titre = "Aide Suspendue";
      const message = generateAideSuspendActivityMessage(aide);
  
      await this.prisma.demandeActivity.create({
        data: {
          demandeId: aide.demandeId,
          aideId: aide.id,
          titre,
          typeField: "aideCancel",
          message,
        },
      });
  
    }
  }
  async deleteAide(args: Prisma.AideDeleteArgs): Promise<PrismaAide> {
    console.log("supression de l'aide...")
    
    console.log("verfication des versement...")
    const paidVersement  = await this.prisma.versement.count({where:{status:'Verse',aideId:args.where.id}})
    if(paidVersement>0)
      throw new common.InternalServerErrorException("il n'est pas possible de supprimer une aide déja versées ou en cours de versement")
    
     const versement = await this.prisma.versement.deleteMany({where:{aideId :{equals:args.where.id}}})
     console.log("versement supprimé",versement)

    /*todo : await this.addDeleteActivity(aide); */
    const aide = await super.deleteAide(args);
    return aide;
  }
  

}



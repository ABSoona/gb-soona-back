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
import { generateAideActivityMessage, generateVersements } from './aide.logic';



@Injectable()
export class AideService extends AideServiceBase {
  constructor(protected readonly prisma: PrismaService,
    protected readonly demandeService: DemandeService
    ) {
    super(prisma);
  }

  async createAide(args: Prisma.AideCreateArgs): Promise<PrismaAide> {

    const aide = await super.createAide(args);
    await this.createRelatedVersement(aide);
    await this.addCreateActivity(aide);

    return aide;
  }
  async updateAide(args: Prisma.AideUpdateArgs): Promise<PrismaAide> {
    const  newStatus= args.data.status;
    const aide = await super.updateAide(args);
    const versement = await this.prisma.versement.deleteMany({where:{aideId :{equals:aide.id},status:{equals:'AVerser'}}})
    await this.createRelatedVersement(aide);
    //todo : await this.addUpdateActivity(aide);
    if(newStatus == 'EnCours' && aide.status=='Expir'){
      await this.demandeService.updateDemandeWhenExpir(aide.id)
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



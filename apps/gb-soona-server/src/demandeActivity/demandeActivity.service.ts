import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DemandeActivityServiceBase } from "./base/demandeActivity.service.base";
import { Prisma, DemandeActivity as PrismaDemandeActivity } from "@prisma/client";
@Injectable()
export class DemandeActivityService extends DemandeActivityServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
 /* tmaintenant traite en front  
 async createDemandeActivity(args: Prisma.DemandeActivityCreateArgs): Promise<PrismaDemandeActivity> {

    const demandeActivity = await super.createDemandeActivity(args);
    demandeActivity.typeField === "abandon" && await this.prisma.demande.update({where:{id:demandeActivity.demandeId},data:{status:"Abandonnée"}})
    if(demandeActivity.typeField === "priseContactEchec"){      
      await this.prisma.demande.update({where:{id:demandeActivity.demandeId},data:{status:"EnAttente"}})
    } 
    if(demandeActivity.typeField === "visite"){      
      await this.prisma.demande.update({where:{id:demandeActivity.demandeId},data:{status:"en_visite"}})
    } 
    return demandeActivity;
  } */

}

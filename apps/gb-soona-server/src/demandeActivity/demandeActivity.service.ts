import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DemandeActivityServiceBase } from "./base/demandeActivity.service.base";
import { Prisma, DemandeActivity as PrismaDemandeActivity } from "@prisma/client";
@Injectable()
export class DemandeActivityService extends DemandeActivityServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }

 async createDemandeActivity(args: Prisma.DemandeActivityCreateArgs): Promise<PrismaDemandeActivity> {

    const demandeActivity = await super.createDemandeActivity(args);
    demandeActivity.typeField === "priseContactReussie" && await this.prisma.demande.update({where:{id:demandeActivity.demandeId},data:{dernierContact: new Date(Date.now()),nombreRelances:0,derniereRelance:null}})
    if (demandeActivity.typeField === "priseContactEchec") {
      const demande = await this.prisma.demande.findUnique({
        where: { id: demandeActivity.demandeId },
        select: { nombreRelances: true },
      });
    
      const currentRelances = demande?.nombreRelances ?? 0;
     console.log("Mise a jour nombre de relance:",currentRelances)
      
      await this.prisma.demande.update({
        where: { id: demandeActivity.demandeId },
        data: {
          derniereRelance: new Date(),
          nombreRelances: currentRelances + 1,
        },
      });
    }

    return demandeActivity;
  } 

}

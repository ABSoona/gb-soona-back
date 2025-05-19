import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { VersementServiceBase } from "./base/versement.service.base";
import { Prisma, Versement } from "@prisma/client";
import { DemandeService } from "src/demande/demande.service";


@Injectable()
export class VersementService extends VersementServiceBase {
  constructor(protected readonly prisma: PrismaService,
    protected readonly demandeService: DemandeService
  ) {
    super(prisma);
  }

  async updateVersement(args: Prisma.VersementUpdateArgs): Promise<Versement> {
    const versement= await super.updateVersement(args);
    const TousVerses = !((await this.prisma.versement.findMany({
      where:{aideId:versement.aideId,status:"AVerser"}})).length>0);
    if(TousVerses){
      await this.prisma.aide.update({where:{id:versement.aideId},data:{status:"Expir"}});
      await this.demandeService.updateDemandeWhenExpir(versement.aideId)
    }

    return versement;
  }
}

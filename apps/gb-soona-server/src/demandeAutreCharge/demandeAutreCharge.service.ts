import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DemandeAutreChargeServiceBase } from "./base/demandeAutreCharge.service.base";

@Injectable()
export class DemandeAutreChargeService extends DemandeAutreChargeServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}

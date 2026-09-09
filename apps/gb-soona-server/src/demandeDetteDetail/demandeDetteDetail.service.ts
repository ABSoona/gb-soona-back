import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DemandeDetteDetailServiceBase } from "./base/demandeDetteDetail.service.base";

@Injectable()
export class DemandeDetteDetailService extends DemandeDetteDetailServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}

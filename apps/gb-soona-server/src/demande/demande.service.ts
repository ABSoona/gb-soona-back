import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DemandeServiceBase } from "./base/demande.service.base";

@Injectable()
export class DemandeService extends DemandeServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}

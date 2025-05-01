import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DemandeStatusHistoryServiceBase } from "./base/demandeStatusHistory.service.base";

@Injectable()
export class DemandeStatusHistoryService extends DemandeStatusHistoryServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}

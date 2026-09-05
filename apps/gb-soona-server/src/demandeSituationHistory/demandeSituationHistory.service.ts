import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DemandeSituationHistoryServiceBase } from "./base/demandeSituationHistory.service.base";

@Injectable()
export class DemandeSituationHistoryService extends DemandeSituationHistoryServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}

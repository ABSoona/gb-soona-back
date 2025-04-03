import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WebsiteDemandeServiceBase } from "./base/websiteDemande.service.base";

@Injectable()
export class WebsiteDemandeService extends WebsiteDemandeServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}

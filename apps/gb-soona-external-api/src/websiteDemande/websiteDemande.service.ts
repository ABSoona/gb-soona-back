import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WebsiteDemandeServiceBase } from "./base/websiteDemande.service.base";
import { Prisma, WebsiteDemande as PrismaWebsiteDemande } from "@prisma/client";
import { QueueDispatcherService } from "src/bullmq/queue-dispatcher.service";
import { Queues } from "src/bullmq/queues";

@Injectable()
export class WebsiteDemandeService extends WebsiteDemandeServiceBase {
  constructor(protected readonly prisma: PrismaService,
    protected readonly queueDispatcherService: QueueDispatcherService ) {
    super(prisma);
  }
  async createWebsiteDemande(
    args: Prisma.WebsiteDemandeCreateArgs
  ): Promise<PrismaWebsiteDemande> {
    const demande = await super.createWebsiteDemande(args);
    await this.queueDispatcherService.dispatch(Queues.DEMANDE, args);
    return demande;
  }
}

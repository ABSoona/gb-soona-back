import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { WebsiteDemandeServiceBase } from "./base/websiteDemande.service.base";
import { QueueDispatcherService } from "src/bullmq/queue-dispatcher.service";
import { Prisma, WebsiteDemande as PrismaWebsiteDemande } from "@prisma/client";
import { Queues } from "src/bullmq/queues";

@Injectable()
export class WebsiteDemandeService extends WebsiteDemandeServiceBase {
  constructor(protected readonly prisma: PrismaService,
    protected readonly queueDispatcherService: QueueDispatcherService) {
    super(prisma);
  }
  async createWebsiteDemande(
    args: Prisma.WebsiteDemandeCreateArgs
  ): Promise<PrismaWebsiteDemande> {
    args.data.status='Recue'
    const demande = await super.createWebsiteDemande(args); // percisiter la demande brute
    await this.queueDispatcherService.dispatch(Queues.DEMANDE, demande); // differer la creation du contact et la demande finale
    return demande;
  }
}



import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { DemandeServiceBase } from "./base/demande.service.base";
import { Prisma, Demande as PrismaDemande } from "@prisma/client";
import { MailService } from "src/mail/mail.service";
import { EnumWebsiteDemandeStatus } from "src/websiteDemande/base/EnumWebsiteDemandeStatus";
import { DemandeNotificationService } from "./demande-notification.service";
import { demandeStatusLabels } from "./demande.data";

@Injectable()
export class DemandeService extends DemandeServiceBase {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly mailService: MailService,
    private readonly notificationService: DemandeNotificationService,
  ) {
    super(prisma);
  }

  async createDemande(args: Prisma.DemandeCreateArgs): Promise<PrismaDemande> {
    const demande = await super.createDemande(args);

    await this.notificationService.notifyNewDemande(demande.id, demande.remarques?demande.remarques:'');

    await this.prisma.demandeActivity.create({
      data: {
        demandeId: demande.id,
        titre: 'Demande Reçue',
        typeField: 'statusUpdate',
        message: `Message du demandeur : ${demande.remarques}`,
      },
    });

    return demande;
  }

  async updateDemande(args: Prisma.DemandeUpdateArgs): Promise<PrismaDemande> {
    const current = await this.prisma.demande.findUnique({ where: { id: args.where.id } });
    const demande = await super.updateDemande(args);

    if (demande.status && current?.status !== demande.status) {
      await this.prisma.demandeStatusHistory.create({
        data: { demandeId: demande.id, status: demande.status },
      });

      const previousLabel = demandeStatusLabels.find(e => e.value === current?.status)?.label;
      const currentLabel = demandeStatusLabels.find(e => e.value === demande.status)?.label;

      await this.prisma.demandeActivity.create({
        data: {
          demandeId: demande.id,
          titre: `La demande est ${currentLabel}`,
          typeField: 'statusUpdate',
          message: `La demande est passée de ${previousLabel} à ${currentLabel}`,
        },
      });

      current?.status && await this.notificationService.notifyStatusChange(demande.id, current.status, demande.status);
    }

    return demande;
  }
}

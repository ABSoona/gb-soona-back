// src/demande/demande-notification.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';


@Injectable()
export class DemandeNotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService
  ) {}

  async notifyNewDemande(demandeId: number, remarques: string) {
    const notifs = await this.prisma.userNotificationPreference.findMany({
      where: { active: true, typeField: 'NouvelleDemande' },
    });

    for (const notif of notifs) {
      const user = await this.prisma.user.findUnique({ where: { id: notif.userId } });
      if (user?.email && user.hasAccess) {
        const lien_demande = `${process.env.FRONTEND_URL}/demandes/${demandeId}`;
        await this.mailService.sendMailAsync(
          'nouvelle-demande',
          user.email,
          { lien_demande },
          'Nouvelle demande enregistrée',
        );
      }
    }
  }

  async notifyStatusChange(demandeId: number, currentStatus: string, newStatus: string) {
    const mapping = {
      en_commision: { notification: 'DemandeEnCommission', label: 'En commission', subject: 'Demande en commission' },
      en_visite: { notification: 'DemandeEnVisite', label: 'En visite', subject: 'Demande en visite' },
    } as const;

    const match = mapping[newStatus as keyof typeof mapping];
    if (!match || currentStatus === newStatus) return;

    const notifs = await this.prisma.userNotificationPreference.findMany({
      where: { active: true, typeField: match.notification },
    });

    for (const notif of notifs) {
      const user = await this.prisma.user.findUnique({ where: { id: notif.userId } });
      if (user?.email && user.hasAccess) {
        const lien_demande = `${process.env.FRONTEND_URL}/demandes/${demandeId}`;
        await this.mailService.sendMailAsync(
          'demande-status-update',
          user.email,
          {
            lien_demande,
            numeroDemande: demandeId.toString(),
            status: match.label,
          },
          match.subject,
        );
      }
    }
  }
}

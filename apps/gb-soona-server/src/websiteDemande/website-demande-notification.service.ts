// src/websiteDemande/website-demande-notification.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

@Injectable()
export class WebsiteDemandeNotificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async notifyError(errorMessage: string) {
    const notifs = await this.prisma.userNotificationPreference.findMany({
      where: { active: true, typeField: 'ErreursDemandes' },
    });

    for (const notif of notifs) {
      const user = await this.prisma.user.findUnique({ where: { id: notif.userId } });

      if (user?.email && Array.isArray(user.roles) && user.roles.includes("admin")) {
        const lien_demande = `${process.env.FRONTEND_URL}/website-demandes`;
        await this.mailService.sendMailAsync(
          'website-demande-error',
          user.email,
          { lien_demande, error_message: errorMessage },
          'Une demande depuis le site internet est bloquée',
        );
      }
    }
  }

  async notifyBlacklistContact(email: string, prenom?: string | null) {
    const contactName = prenom ?? 'Assalamou Alaykoum';
    await this.mailService.sendMailAsync(
      'contact-blacklist',
      email,
      { contact_name: contactName },
      'Suite à votre demande sur soona.fr',
    );
  }
}

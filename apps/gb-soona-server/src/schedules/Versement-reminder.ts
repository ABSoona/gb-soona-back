import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class VersementReminderService {
  private readonly logger = new Logger(VersementReminderService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async rappelEcheancePremierVersement() {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    this.logger.log(`🔍 Vérification des rappels de versement (DDay / Late)`);

    const aides = await this.prisma.aide.findMany({
      where: {
        status: 'EnCours',
        acteurAlertSent: false,
        acteurVersementId: { not: null },

        // IMPORTANT: pour permettre "late", on inclut les dates passées
        dateAide: { lte: end },
      },
      include: {
        acteurVersement: true,
        contact: true,
      },
    });

    if (aides.length === 0) {
      this.logger.log('✅ Aucune aide à alerter.');
      return;
    }

    for (const aide of aides) {
      const user = aide.acteurVersement;
      if (!user?.email) continue;

      // 1) Premier versement (le plus ancien)
      const firstVersement = await this.prisma.versement.findFirst({
        where: { aideId: aide.id },
        orderBy: { dataVersement: 'asc' },
        select: { status: true, dataVersement: true, montant: true },
      });

      if (!firstVersement) continue;
      if (firstVersement.status !== 'AVerser') continue;

      // 2) Choix du template selon DDay vs Late
      const isDday =
        firstVersement.dataVersement >= start &&
        firstVersement.dataVersement <= end;

      const template = isDday
        ? 'versement-reminder-dday'
        : 'versement-reminder-late';

      const subject = isDday
        ? "Rappel : versement à effectuer aujourd’hui"
        : "Rappel : versement en retard (à effectuer)";

      // 3) Anti double-envoi (robuste multi-instance)
      const reserved = await this.prisma.aide.updateMany({
        where: { id: aide.id, acteurAlertSent: false },
        data: { acteurAlertSent: true },
      });
      if (reserved.count === 0) continue;

      try {
        const lien_versement = `${process.env.FRONT_URL}/versements}`;

        await this.mailService.sendMailAsync(
          template,
          user.email,
          {
            lien_versement,
            beneficiaire: `${aide.contact?.prenom ?? ''} ${aide.contact?.nom ?? ''}`.trim(),
            montant: `${(firstVersement.montant ?? aide.montant ?? 0).toLocaleString()}€`,
            nombreVersements: `${aide.nombreVersements ?? ''}`,
            dateAide: `${firstVersement.dataVersement?.toLocaleDateString()}`,
            demandeId: `${aide.demandeId ?? ''}`,
          },
          subject,
        );

        this.logger.log(
          `📧 Mail "${template}" envoyé à ${user.email} (aide #${aide.id})`,
        );
      } catch (error) {
        // rollback => retente demain
        await this.prisma.aide.update({
          where: { id: aide.id },
          data: { acteurAlertSent: false },
        });

        this.logger.error(
          `❌ Erreur envoi mail aide #${aide.id} (${user.email})`,
        String(error),
        );
      }
    }

    this.logger.log('✅ Cron terminé.');
  }
}

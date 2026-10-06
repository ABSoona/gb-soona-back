import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { TelegramBot } from 'src/telegram/telegram.bot';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  getActivityReportData,
  buildActivityReportHtml,
  generateActivityReportPdfBuffer,
} from './activity-report.helper';

@Injectable()
export class MonthlyReportCronService {
  private readonly logger = new Logger(MonthlyReportCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramBot: TelegramBot,
  ) {}

  // Exécution le 1er de chaque mois à 08:00
  @Cron('0 8 1 * *')
  async handleMonthlyReport() {
    this.logger.log('Début de la génération du rapport mensuel...');

    const now = new Date();
    const targetDate = subMonths(now, 1);
    const debut = startOfMonth(targetDate);
    const fin = endOfMonth(targetDate);

    const moisAnneeStr = format(targetDate, 'MMMM yyyy', { locale: fr });
    const periodLabel = moisAnneeStr.charAt(0).toUpperCase() + moisAnneeStr.slice(1);

    // Période glissante 3 mois pour les indicateurs de délais
    const debut3Mois = startOfMonth(subMonths(now, 3));
    const fin3Mois = endOfMonth(subMonths(now, 1));

    try {
      const data = await getActivityReportData(this.prisma, debut, fin, { debut3Mois, fin3Mois });
      const htmlContent = buildActivityReportHtml(data, periodLabel);

      this.logger.log('Lancement de Puppeteer pour la génération PDF...');
      const pdfBuffer = await generateActivityReportPdfBuffer(htmlContent);

      const fileName = `Rapport_Activite_${format(targetDate, 'yyyy_MM')}.pdf`;
      const filePath = path.join(os.tmpdir(), fileName);
      fs.writeFileSync(filePath, pdfBuffer);
      this.logger.log(`PDF généré : ${filePath}`);

      await this.telegramBot.sendDocument(
        filePath,
        fileName,
        `📊 *Rapport d'activité — ${periodLabel}*`,
      );

      this.logger.log('Rapport envoyé avec succès sur Telegram.');

      fs.unlinkSync(filePath);
    } catch (error) {
      this.logger.error(
        "Erreur lors de la génération ou de l'envoi du rapport mensuel",
        error,
      );
    }
  }
}

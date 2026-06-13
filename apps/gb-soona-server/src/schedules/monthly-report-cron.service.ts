import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { TelegramBot } from 'src/telegram/telegram.bot';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { fr } from 'date-fns/locale';

@Injectable()
export class MonthlyReportCronService {
  private readonly logger = new Logger(MonthlyReportCronService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly telegramBot: TelegramBot,
  ) {}

  // Exécution le 1er de chaque mois à 08:00
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleMonthlyReport() {
    this.logger.log('Début de la génération du rapport mensuel...');

    const now = new Date();
    const targetDate = subMonths(now, 1);
    const debut = startOfMonth(targetDate);
    const fin = endOfMonth(targetDate);

    const moisAnneeStr = format(targetDate, 'MMMM yyyy', { locale: fr });
    const moisAnneeCapitalized =
      moisAnneeStr.charAt(0).toUpperCase() + moisAnneeStr.slice(1);

    try {
      // ==========================================
      // 1. RÉCUPÉRATION DES DONNÉES DEPUIS PRISMA
      // ==========================================

      // Demandes reçues dans le mois (createdAt)
      const demRecues = await this.prisma.demande.findMany({
        where: { createdAt: { gte: debut, lte: fin } },
        select: { id: true, contact: { select: { codePostal: true } } },
      });

      // Demandes acceptées basées sur decisionDate
      const demAcceptees = await this.prisma.demande.findMany({
        where: {
          status: { in: ['clôturée', 'en_commision', 'en_visite', 'EnCours'] },
          decisionDate: { gte: debut, lte: fin },
        },
        select: { id: true, contact: { select: { codePostal: true } } },
      });

      // Demandes refusées basées sur decisionDate
      const demRefusees = await this.prisma.demande.findMany({
        where: {
          status: { in: ['refusée', 'Abandonnée'] },
          decisionDate: { gte: debut, lte: fin },
        },
        select: { id: true, contact: { select: { codePostal: true } } },
      });

      // Backlog : toutes les demandes au statut 'recue' (stock total)
      const demBacklog = await this.prisma.demande.findMany({
        where: { status: 'recue' },
        select: { id: true, contact: { select: { codePostal: true } } },
      });

      // Visites programmées créées dans le mois
      const visitesProg = await this.prisma.visite.count({
        where: {
          createdAt: { gte: debut, lte: fin },
          status: 'Programee',
        },
      });

      // Aides accordées créées dans le mois
      const aides = await this.prisma.aide.aggregate({
        where: { createdAt: { gte: debut, lte: fin } },
        _count: true,
        _sum: { montant: true },
      });

      // Versements versés dans le mois (basé sur dataVersement)
      const versements = await this.prisma.versement.aggregate({
        where: {
          status: 'Verse',
          dataVersement: { gte: debut, lte: fin },
        },
        _count: true,
        _sum: { montant: true },
      });

      // Versements annulés dans le mois
      const versementsAnnules = await this.prisma.versement.aggregate({
        where: {
          status: 'Annulee',
          dataVersement: { gte: debut, lte: fin },
        },
        _count: true,
        _sum: { montant: true },
      });

      // ==========================================
      // 2. AGRÉGATION PAR DÉPARTEMENT
      // ==========================================

      const extractDept = (cp: number | null | undefined): string => {
        if (!cp) return 'Non communiqué';
        return cp.toString().padStart(5, '0').substring(0, 2);
      };

      const deptStats: Record<
        string,
        { recues: number; acceptees: number; refusees: number; backlog: number }
      > = {};
      const allDepts = new Set<string>();

      const processList = (list: any[], key: keyof typeof deptStats[string]) => {
        list.forEach((item) => {
          const d = extractDept(item.contact?.codePostal);
          allDepts.add(d);
          if (!deptStats[d])
            deptStats[d] = { recues: 0, acceptees: 0, refusees: 0, backlog: 0 };
          deptStats[d][key]++;
        });
      };

      processList(demRecues, 'recues');
      processList(demAcceptees, 'acceptees');
      processList(demRefusees, 'refusees');
      processList(demBacklog, 'backlog');

      const sortedDepts = Array.from(allDepts).sort((a, b) => {
        if (a === 'Non communiqué') return 1;
        if (b === 'Non communiqué') return -1;
        return a.localeCompare(b);
      });

      let tableRows = '';
      sortedDepts.forEach((d) => {
        const s = deptStats[d];
        tableRows += `
          <tr>
            <td>${d}</td>
            <td>${s.recues}</td>
            <td>${s.acceptees}</td>
            <td>${s.refusees}</td>
            <td>${s.backlog}</td>
          </tr>`;
      });

      // ==========================================
      // 3. GÉNÉRATION DU HTML
      // ==========================================

      const formatEuro = (val: number | null | undefined): string => {
        if (!val) return '0,00 €';
        return new Intl.NumberFormat('fr-FR', {
          style: 'currency',
          currency: 'EUR',
        }).format(val);
      };

      const htmlContent = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          @page { size: 1280px 720px; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background: #FFFFFF; }
          .slide-container { width: 1280px; height: 720px; background: #FFFFFF; font-family: 'Inter', sans-serif; color: #065F46; overflow: hidden; page-break-after: always; page-break-inside: avoid; }
          .top-bar { width: 100%; height: 5px; background: #10B981; }
          .header { background: #064E3B; padding: 18px 48px; display: flex; align-items: center; justify-content: space-between; }
          .header h1 { font-size: 28px; font-weight: 700; color: #FFFFFF; }
          .header .month-badge { font-size: 15px; font-weight: 600; color: #D1FAE5; background: rgba(255,255,255,0.12); padding: 5px 16px; border-radius: 4px; }
          .body { display: flex; padding: 24px 48px; gap: 0; height: calc(100% - 75px); }
          .col-left { width: 38%; padding-right: 36px; border-right: 2px solid #D1FAE5; display: flex; flex-direction: column; gap: 10px; }
          .col-right { width: 62%; padding-left: 36px; }
          .col-half { width: 50%; display: flex; flex-direction: column; gap: 20px; }
          .col-half.left { padding-right: 48px; border-right: 2px solid #D1FAE5; }
          .col-half.right { padding-left: 48px; }
          .section-title { font-size: 13px; font-weight: 700; color: #10B981; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
          .kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .kpi-card { background: #F0FDF4; border-left: 4px solid #10B981; padding: 12px 14px; }
          .kpi-card.refused  { border-left-color: #6B7280; }
          .kpi-card.backlog  { border-left-color: #F59E0B; }
          .kpi-card.accepted { border-left-color: #10B981; }
          .kpi-card.received { border-left-color: #064E3B; }
          .kpi-value { font-size: 36px; font-weight: 700; color: #064E3B; line-height: 1; }
          .kpi-label { font-size: 13px; font-weight: 400; color: #065F46; margin-top: 4px; }
          .visites-box { margin-top: 12px; background: #D1FAE5; padding: 12px 14px; border-left: 4px solid #064E3B; }
          .visites-box .visites-title { font-size: 13px; font-weight: 700; color: #064E3B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
          .visites-box .visites-value { font-size: 28px; font-weight: 700; color: #064E3B; }
          .visites-box .visites-note { font-size: 11px; color: #065F46; margin-top: 4px; font-style: italic; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          thead tr { background: #064E3B; color: #FFFFFF; }
          thead th { padding: 9px 12px; font-weight: 700; text-align: center; font-size: 13px; }
          thead th:first-child { text-align: left; }
          tbody tr:nth-child(odd)  { background: #F0FDF4; }
          tbody tr:nth-child(even) { background: #FFFFFF; }
          tbody tr.total-row { background: #D1FAE5; font-weight: 700; }
          tbody td { padding: 7px 12px; text-align: center; color: #065F46; font-size: 14px; }
          tbody td:first-child { text-align: left; font-weight: 600; }
          .note-text { font-size: 11px; color: #6B7280; font-style: italic; margin-top: 8px; }
          .big-metric { display: flex; flex-direction: column; gap: 4px; margin-bottom: 20px; }
          .big-value { font-size: 64px; font-weight: 700; color: #064E3B; line-height: 1; }
          .big-label { font-size: 18px; font-weight: 400; color: #065F46; }
          .divider { width: 48px; height: 3px; background: #10B981; margin-bottom: 20px; }
          .info-box { background: #F0FDF4; border-left: 4px solid #10B981; padding: 14px 18px; margin-top: 8px; }
          .info-box .info-label { font-size: 13px; font-weight: 600; color: #064E3B; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
          .info-box .info-value { font-size: 22px; font-weight: 700; color: #064E3B; }
          .annule-box { background: #FEF9C3; border-left: 4px solid #F59E0B; padding: 12px 18px; margin-top: 12px; }
          .annule-box .annule-label { font-size: 13px; font-weight: 600; color: #92400E; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 2px; }
          .annule-box .annule-value { font-size: 18px; font-weight: 700; color: #92400E; }
        </style>
      </head>
      <body>

        <!-- SLIDE 1 : Demandes & Visites -->
        <div class="slide-container">
          <div class="top-bar"></div>
          <div class="header">
            <h1>Demandes &amp; Visites</h1>
            <span class="month-badge">${moisAnneeCapitalized}</span>
          </div>
          <div class="body">
            <div class="col-left">
              <div class="section-title">Indicateurs clés</div>
              <div class="kpi-grid">
                <div class="kpi-card received">
                  <div class="kpi-value">${demRecues.length}</div>
                  <div class="kpi-label">Demandes reçues</div>
                </div>
                <div class="kpi-card accepted">
                  <div class="kpi-value">${demAcceptees.length}</div>
                  <div class="kpi-label">Demandes acceptées</div>
                </div>
                <div class="kpi-card refused">
                  <div class="kpi-value">${demRefusees.length}</div>
                  <div class="kpi-label">Demandes refusées</div>
                </div>
                <div class="kpi-card backlog">
                  <div class="kpi-value">${demBacklog.length}</div>
                  <div class="kpi-label">Backlog</div>
                </div>
              </div>
              <div class="visites-box">
                <div class="visites-title">Visites bénévoles</div>
                <div class="visites-value">${visitesProg} programmées</div>
                <div class="visites-note">Attribuées à un bénévole. La date de réalisation effective est rarement mise à jour — chiffre sous-estimé.</div>
              </div>
              <div class="note-text">Acceptées/Refusées : basées sur la date de décision. Backlog : stock total des demandes au statut « reçue ».</div>
            </div>
            <div class="col-right">
              <div class="section-title">Répartition par département</div>
              <table>
                <thead>
                  <tr>
                    <th>Département</th>
                    <th>Reçues</th>
                    <th>Acceptées</th>
                    <th>Refusées</th>
                    <th>Backlog</th>
                  </tr>
                </thead>
                <tbody>
                  ${tableRows}
                  <tr class="total-row">
                    <td>Total</td>
                    <td>${demRecues.length}</td>
                    <td>${demAcceptees.length}</td>
                    <td>${demRefusees.length}</td>
                    <td>${demBacklog.length}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- SLIDE 2 : Aides & Versements -->
        <div class="slide-container">
          <div class="top-bar"></div>
          <div class="header">
            <h1>Aides &amp; Versements</h1>
            <span class="month-badge">${moisAnneeCapitalized}</span>
          </div>
          <div class="body">
            <div class="col-half left">
              <div class="section-title">Aides accordées</div>
              <div class="big-metric">
                <div class="big-value">${aides._count}</div>
                <div class="big-label">aides accordées en ${moisAnneeStr}</div>
              </div>
              <div class="divider"></div>
              <div class="info-box">
                <div class="info-label">Montant total des aides</div>
                <div class="info-value">${formatEuro(aides._sum.montant)}</div>
              </div>
              <div class="note-text">Toutes les aides sont de nature financière. Comptabilisées selon la date de création (createdAt).</div>
            </div>
            <div class="col-half right">
              <div class="section-title">Versements effectués</div>
              <div class="big-metric">
                <div class="big-value">${versements._count}</div>
                <div class="big-label">versements réalisés en ${moisAnneeStr}</div>
              </div>
              <div class="divider"></div>
              <div class="info-box">
                <div class="info-label">Montant total versé</div>
                <div class="info-value">${formatEuro(versements._sum.montant)}</div>
              </div>
              <div class="annule-box">
                <div class="annule-label">Versements annulés</div>
                <div class="annule-value">${versementsAnnules._count} versements — ${formatEuro(versementsAnnules._sum.montant)}</div>
              </div>
              <div class="note-text">Basés sur la date effective de versement (dataVersement).</div>
            </div>
          </div>
        </div>

      </body>
      </html>`;

      // ==========================================
      // 4. GÉNÉRATION DU PDF AVEC PUPPETEER
      // ==========================================

      this.logger.log('Lancement de Puppeteer pour la génération PDF...');

      const browser = await puppeteer.launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setContent(htmlContent, { waitUntil: 'load' });

      const pdfBuffer = await page.pdf({
        width: '1280px',
        height: '720px',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        preferCSSPageSize: true,
      });

      await browser.close();

      const fileName = `Rapport_Activite_${format(targetDate, 'yyyy_MM')}.pdf`;
      const filePath = path.join(os.tmpdir(), fileName);
      fs.writeFileSync(filePath, pdfBuffer);
      this.logger.log(`PDF généré : ${filePath}`);

      // ==========================================
      // 5. ENVOI VIA LE SERVICE TELEGRAM EXISTANT
      // ==========================================

      await this.telegramBot.sendDocument(
        filePath,
        fileName,
        `📊 *Rapport d'activité — ${moisAnneeCapitalized}*`,
      );

      this.logger.log('Rapport envoyé avec succès sur Telegram.');

      // Nettoyage du fichier temporaire
      fs.unlinkSync(filePath);

    } catch (error) {
      this.logger.error(
        "Erreur lors de la génération ou de l'envoi du rapport mensuel",
        error,
      );
    }
  }
}
import { PrismaService } from 'src/prisma/prisma.service';
import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';
import { format, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

// Alignes sur la definition de "Demandes Traités" du rapport "Tableau
// rectificatif mensuel" (rapportMensuelService.ts) : Acceptées + Refusées
// doit redonner le meme total que Traités.
const STATUTS_ACCEPTES = ['EnCours'];
const STATUTS_REFUSES = ['refusée'];

export interface ActivityReportStats {
  moy: number | null;
  min: number | null;
  max: number | null;
}

export interface ActivityReportDepartement {
  departement: string;
  recues: number;
  acceptees: number;
  refusees: number;
  backlog: number;
}

export interface ActivityReportData {
  debut: Date;
  fin: Date;
  demRecues: number;
  demAcceptees: number;
  demRefusees: number;
  demBacklog: number;
  visitesProg: number;
  aidesCount: number;
  aidesMontant: number;
  versementsCount: number;
  versementsMontant: number;
  departements: ActivityReportDepartement[];
  delais: {
    periodeLabel: string;
    priseEnCharge: ActivityReportStats;
    traitement: ActivityReportStats;
  };
}

function calcStats(arr: number[]): ActivityReportStats {
  if (arr.length === 0) return { moy: null, min: null, max: null };
  const moy = Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
  return { moy, min: Math.min(...arr), max: Math.max(...arr) };
}

function extractDept(cp: number | string | null | undefined): string {
  if (!cp) return 'Non communiqué';
  return cp.toString().padStart(5, '0').substring(0, 2);
}

// Calcule les donnees du rapport d'activite (demandes, visites, aides,
// versements, delais) sur [debut, fin]. Les indicateurs de delais sont
// toujours calcules sur une fenetre glissante independante (par defaut les
// 3 mois se terminant a `fin`) : un delai moyen sur une periode trop courte
// n'aurait pas de sens statistique.
export async function getActivityReportData(
  prisma: PrismaService,
  debut: Date,
  fin: Date,
  delaisWindow?: { debut3Mois: Date; fin3Mois: Date },
): Promise<ActivityReportData> {
  const debut3Mois = delaisWindow?.debut3Mois ?? subMonths(fin, 3);
  const fin3Mois = delaisWindow?.fin3Mois ?? fin;
  const periodeLabel = `${format(debut3Mois, 'MMM', { locale: fr })} – ${format(fin3Mois, 'MMM yyyy', { locale: fr })}`;

  const demRecuesList = await prisma.demande.findMany({
    where: { createdAt: { gte: debut, lte: fin } },
    select: { id: true, contact: { select: { codePostal: true } } },
  });

  // Demandes "acceptées" / "refusées" : basé sur le premier changement de
  // statut de la demande vers l'un de ces statuts-cibles, figé dans
  // DemandeStatusHistory — pas sur le statut actuel ni sur `decisionDate`
  // (ecrasee a chaque changement de statut, donc pas une date stable dans
  // le temps : regenerer ce rapport plus tard pour la meme periode donnerait
  // un resultat different si le statut a change depuis). Une demande n'est
  // comptee qu'une seule fois, au mois de ce premier changement, dans la
  // categorie correspondant a la direction prise a ce moment-la.
  const demandesAvecPremiereDecision = await prisma.demande.findMany({
    where: {
      demandeStatusHistories: {
        some: { status: { in: [...STATUTS_ACCEPTES, ...STATUTS_REFUSES] } },
      },
    },
    select: {
      id: true,
      contact: { select: { codePostal: true } },
      demandeStatusHistories: {
        where: { status: { in: [...STATUTS_ACCEPTES, ...STATUTS_REFUSES] } },
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: { status: true, createdAt: true },
      },
    },
  });

  type DemandeAvecContact = { contact: { codePostal: number | null } | null };
  const demAccepteesList: DemandeAvecContact[] = [];
  const demRefuseesList: DemandeAvecContact[] = [];

  for (const demande of demandesAvecPremiereDecision) {
    const premiere = demande.demandeStatusHistories[0];
    if (!premiere || premiere.createdAt < debut || premiere.createdAt > fin) continue;
    if (STATUTS_ACCEPTES.includes(premiere.status)) {
      demAccepteesList.push({ contact: demande.contact });
    } else if (STATUTS_REFUSES.includes(premiere.status)) {
      demRefuseesList.push({ contact: demande.contact });
    }
  }

  // Backlog : stock total des demandes au statut 'recue', independant de la periode.
  const demBacklogList = await prisma.demande.findMany({
    where: { status: 'recue' },
    select: { id: true, contact: { select: { codePostal: true } } },
  });

  const visitesProg = await prisma.visite.count({
    where: { createdAt: { gte: debut, lte: fin }, status: 'Programee' },
  });

  const aides = await prisma.aide.aggregate({
    where: { createdAt: { gte: debut, lte: fin } },
    _count: true,
    _sum: { montant: true },
  });

  const versements = await prisma.versement.aggregate({
    where: { status: 'Verse', dataVersement: { gte: debut, lte: fin } },
    _count: true,
    _sum: { montant: true },
  });

  // Delai de prise en charge : reception -> premiere prise de contact
  // (DemandeActivity priseContactEchec/priseContactReussie), ou a defaut
  // le premier passage en statut EnAttenteDocs.
  const demandesAvecDelais = await prisma.demande.findMany({
    where: { createdAt: { gte: debut3Mois, lte: fin3Mois } },
    select: {
      id: true,
      createdAt: true,
      demandeActivities: {
        where: { typeField: { in: ['priseContactEchec', 'priseContactReussie'] } },
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: { createdAt: true },
      },
      demandeStatusHistories: {
        where: { status: 'EnAttenteDocs' },
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  const delaisPriseEnCharge: number[] = [];
  for (const d of demandesAvecDelais) {
    let eventDate: Date | null = null;
    if (d.demandeActivities.length > 0) {
      eventDate = d.demandeActivities[0].createdAt;
    } else if (d.demandeStatusHistories.length > 0) {
      eventDate = d.demandeStatusHistories[0].createdAt;
    }
    if (eventDate && d.createdAt) {
      const diffJours = Math.round((eventDate.getTime() - d.createdAt.getTime()) / 86400000);
      if (diffJours >= 0) delaisPriseEnCharge.push(diffJours);
    }
  }

  // Delai de traitement : reception -> premier passage en statut 'EnCours'
  // ou 'refusée' (le premier des deux a survenir). Meme definition que le
  // rapport "Tableau rectificatif mensuel" (rapportMensuelService.ts),
  // pour que les deux rapports donnent le meme chiffre.
  const demandesAvecTraitement = await prisma.demande.findMany({
    where: { createdAt: { gte: debut3Mois, lte: fin3Mois } },
    select: {
      id: true,
      createdAt: true,
      demandeStatusHistories: {
        where: { status: { in: ['EnCours', 'refusée'] } },
        orderBy: { createdAt: 'asc' },
        take: 1,
        select: { createdAt: true },
      },
    },
  });

  const delaisTraitement: number[] = [];
  for (const d of demandesAvecTraitement) {
    if (!d.createdAt || d.demandeStatusHistories.length === 0) continue;
    const diffJours = Math.round(
      (d.demandeStatusHistories[0].createdAt.getTime() - d.createdAt.getTime()) / 86400000,
    );
    if (diffJours >= 0) delaisTraitement.push(diffJours);
  }

  const deptStats: Record<string, { recues: number; acceptees: number; refusees: number; backlog: number }> = {};
  const allDepts = new Set<string>();
  const processList = (
    list: { contact: { codePostal: number | null } | null }[],
    key: 'recues' | 'acceptees' | 'refusees' | 'backlog',
  ) => {
    list.forEach((item) => {
      const d = extractDept(item.contact?.codePostal);
      allDepts.add(d);
      if (!deptStats[d]) deptStats[d] = { recues: 0, acceptees: 0, refusees: 0, backlog: 0 };
      deptStats[d][key]++;
    });
  };
  processList(demRecuesList, 'recues');
  processList(demAccepteesList, 'acceptees');
  processList(demRefuseesList, 'refusees');
  processList(demBacklogList, 'backlog');

  const sortedDepts = Array.from(allDepts).sort((a, b) => {
    if (a === 'Non communiqué') return 1;
    if (b === 'Non communiqué') return -1;
    return a.localeCompare(b);
  });

  return {
    debut,
    fin,
    demRecues: demRecuesList.length,
    demAcceptees: demAccepteesList.length,
    demRefusees: demRefuseesList.length,
    demBacklog: demBacklogList.length,
    visitesProg,
    aidesCount: aides._count as unknown as number,
    aidesMontant: aides._sum.montant ?? 0,
    versementsCount: versements._count as unknown as number,
    versementsMontant: versements._sum.montant ?? 0,
    departements: sortedDepts.map((d) => ({ departement: d, ...deptStats[d] })),
    delais: {
      periodeLabel,
      priseEnCharge: calcStats(delaisPriseEnCharge),
      traitement: calcStats(delaisTraitement),
    },
  };
}

function formatEuro(val: number | null | undefined): string {
  if (!val) return '0,00 €';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(val);
}

// Construit le HTML (2 "slides" imprimables) a partir des donnees calculees
// par getActivityReportData, pour un rendu PDF via puppeteer.
export function buildActivityReportHtml(data: ActivityReportData, periodLabel: string): string {
  const LOGO_PATH = path.resolve(__dirname, '../../assets/soona-logo.png');
  const LOGO_SRC = `data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString('base64')}`;

  const tableRows = data.departements
    .map(
      (d) => `
          <tr>
            <td>${d.departement}</td>
            <td>${d.recues}</td>
            <td>${d.acceptees}</td>
            <td>${d.refusees}</td>
            <td>${d.backlog}</td>
          </tr>`,
    )
    .join('');

  const { priseEnCharge, traitement } = data.delais;

  return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          @page { size: 1280px 720px; margin: 0; }
          * { margin: 0; padding: 0; box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background: #FFFFFF; }
          .slide-container { width: 1280px; height: 720px; background: #FFFFFF; font-family: 'Inter', sans-serif; color: #1a5f7a; overflow: hidden; page-break-after: always; page-break-inside: avoid; }
          .top-bar { width: 100%; height: 5px; background: #3bbcd4; }
          .header { background: #2aa8c4; padding: 14px 48px; display: flex; align-items: center; justify-content: space-between; }
          .header-left { display: flex; align-items: center; gap: 18px; }
          .header-logo { height: 44px; width: auto; object-fit: contain; filter: brightness(0) invert(1); }
          .header h1 { font-size: 26px; font-weight: 700; color: #FFFFFF; }
          .header .month-badge { font-size: 15px; font-weight: 600; color: #FFFFFF; background: rgba(255,255,255,0.2); padding: 5px 16px; border-radius: 4px; }
          .body { display: flex; padding: 24px 48px; gap: 0; height: calc(100% - 73px); }
          .col-left { width: 38%; padding-right: 36px; border-right: 2px solid #b8e8f0; display: flex; flex-direction: column; gap: 10px; }
          .col-right { width: 62%; padding-left: 36px; }
          .col-half { width: 50%; display: flex; flex-direction: column; gap: 20px; }
          .col-half.left { padding-right: 48px; border-right: 2px solid #b8e8f0; }
          .col-half.right { padding-left: 48px; }
          .section-title { font-size: 13px; font-weight: 700; color: #2aa8c4; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
          .kpi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
          .kpi-card { background: #eaf8fb; border-left: 4px solid #2aa8c4; padding: 12px 14px; }
          .kpi-card.refused  { border-left-color: #6B7280; }
          .kpi-card.backlog  { border-left-color: #F59E0B; }
          .kpi-card.accepted { border-left-color: #2aa8c4; }
          .kpi-card.received { border-left-color: #1a7a94; }
          .kpi-value { font-size: 36px; font-weight: 700; color: #1a5f7a; line-height: 1; }
          .kpi-label { font-size: 13px; font-weight: 400; color: #2a7a94; margin-top: 4px; }
          .visites-box { margin-top: 12px; background: #b8e8f0; padding: 12px 14px; border-left: 4px solid #1a7a94; }
          .visites-box .visites-title { font-size: 13px; font-weight: 700; color: #1a5f7a; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
          .visites-box .visites-value { font-size: 28px; font-weight: 700; color: #1a5f7a; }
          .visites-box .visites-note { font-size: 11px; color: #1a5f7a; margin-top: 4px; font-style: italic; }
          table { width: 100%; border-collapse: collapse; font-size: 14px; }
          thead tr { background: #2aa8c4; color: #FFFFFF; }
          thead th { padding: 9px 12px; font-weight: 700; text-align: center; font-size: 13px; }
          thead th:first-child { text-align: left; }
          tbody tr:nth-child(odd)  { background: #eaf8fb; }
          tbody tr:nth-child(even) { background: #FFFFFF; }
          tbody tr.total-row { background: #b8e8f0; font-weight: 700; }
          tbody td { padding: 7px 12px; text-align: center; color: #1a5f7a; font-size: 14px; }
          tbody td:first-child { text-align: left; font-weight: 600; }
          .note-text { font-size: 11px; color: #6B7280; font-style: italic; margin-top: 8px; }
          .big-metric { display: flex; flex-direction: column; gap: 4px; margin-bottom: 20px; }
          .big-value { font-size: 64px; font-weight: 700; color: #1a5f7a; line-height: 1; }
          .big-label { font-size: 18px; font-weight: 400; color: #2a7a94; }
          .divider { width: 48px; height: 3px; background: #2aa8c4; margin-bottom: 20px; }
          .info-box { background: #eaf8fb; border-left: 4px solid #2aa8c4; padding: 14px 18px; margin-top: 8px; }
          .info-box .info-label { font-size: 13px; font-weight: 600; color: #1a5f7a; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 4px; }
          .info-box .info-value { font-size: 22px; font-weight: 700; color: #1a5f7a; }
        </style>
      </head>
      <body>

        <!-- SLIDE 1 : Demandes & Visites -->
        <div class="slide-container">
          <div class="top-bar"></div>
          <div class="header">
            <div class="header-left">
              <img class="header-logo" src="${LOGO_SRC}" alt="Logo Soona" />
              <h1>Demandes &amp; Visites</h1>
            </div>
            <span class="month-badge">${periodLabel}</span>
          </div>
          <div class="body">
            <div class="col-left">
              <div class="section-title">Indicateurs clés</div>
              <div class="kpi-grid">
                <div class="kpi-card received">
                  <div class="kpi-value">${data.demRecues}</div>
                  <div class="kpi-label">Demandes reçues</div>
                </div>
                <div class="kpi-card accepted">
                  <div class="kpi-value">${data.demAcceptees}</div>
                  <div class="kpi-label">Demandes acceptées</div>
                </div>
                <div class="kpi-card refused">
                  <div class="kpi-value">${data.demRefusees}</div>
                  <div class="kpi-label">Demandes refusées</div>
                </div>
                <div class="kpi-card backlog">
                  <div class="kpi-value">${data.demBacklog}</div>
                  <div class="kpi-label">Backlog</div>
                </div>
              </div>
              <!-- DÉLAIS -->
              <div class="section-title" style="margin-top:8px;">Délais (${data.delais.periodeLabel})</div>
              <div class="kpi-grid">
                <div class="kpi-card" style="border-left-color:#7c3aed;">
                  <div class="kpi-value" style="font-size:22px;">${priseEnCharge.moy !== null ? priseEnCharge.moy + ' j' : 'N/A'}</div>
                  <div class="kpi-label">Délai de prise en charge moyen<br/><span style="font-size:10px;">min ${priseEnCharge.min ?? '—'} j · max ${priseEnCharge.max ?? '—'} j</span></div>
                </div>
                <div class="kpi-card" style="border-left-color:#0891b2;">
                  <div class="kpi-value" style="font-size:22px;">${traitement.moy !== null ? traitement.moy + ' j' : 'N/A'}</div>
                  <div class="kpi-label">Délais de traitement moyen<br/><span style="font-size:10px;">min ${traitement.min ?? '—'} j · max ${traitement.max ?? '—'} j</span></div>
                </div>
              </div>
              <div class="visites-box">
                <div class="visites-title">Visites bénévoles</div>
                <div class="visites-value">${data.visitesProg} programmées</div>
                <div class="visites-note">Attribuées à un bénévole. La date de réalisation effective est rarement mise à jour — chiffre sous-estimé.</div>
              </div>
              <div class="note-text">Acceptées : premier passage en statut « En cours ». Refusées : premier passage en statut « Refusée » (Acceptées + Refusées = Demandes Traités du tableau rectificatif mensuel). Backlog : stock total des demandes au statut « reçue ». Délai de prise en charge : entre la réception et la première prise de contact avec le bénéficiaire. Délai de traitement : entre la réception et le premier passage en statut « En cours » ou « Refusée ».</div>
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
                    <td>${data.demRecues}</td>
                    <td>${data.demAcceptees}</td>
                    <td>${data.demRefusees}</td>
                    <td>${data.demBacklog}</td>
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
            <div class="header-left">
              <img class="header-logo" src="${LOGO_SRC}" alt="Logo Soona" />
              <h1>Aides &amp; Versements</h1>
            </div>
            <span class="month-badge">${periodLabel}</span>
          </div>
          <div class="body">
            <div class="col-half left">
              <div class="section-title">Aides accordées</div>
              <div class="big-metric">
                <div class="big-value">${data.aidesCount}</div>
                <div class="big-label">aides accordées sur la période</div>
              </div>
              <div class="divider"></div>
              <div class="info-box">
                <div class="info-label">Montant total des aides</div>
                <div class="info-value">${formatEuro(data.aidesMontant)}</div>
              </div>
              <div class="note-text">Toutes les aides sont de nature financière. Comptabilisées selon la date de création.</div>
            </div>
            <div class="col-half right">
              <div class="section-title">Versements effectués</div>
              <div class="big-metric">
                <div class="big-value">${data.versementsCount}</div>
                <div class="big-label">versements réalisés sur la période</div>
              </div>
              <div class="divider"></div>
              <div class="info-box">
                <div class="info-label">Montant total versé</div>
                <div class="info-value">${formatEuro(data.versementsMontant)}</div>
              </div>
              <div class="note-text">Basés sur la date effective de versement (dataVersement).</div>
            </div>
          </div>
        </div>

      </body>
      </html>`;
}

export async function generateActivityReportPdfBuffer(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'load' });

  const pdfBuffer = await page.pdf({
    width: '1280px',
    height: '720px',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    preferCSSPageSize: true,
  });

  await browser.close();
  return pdfBuffer as Buffer;
}

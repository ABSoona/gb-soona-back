import * as fs from "fs";
import * as path from "path";
import { Contact, Demande } from "@prisma/client";
import { Response } from "express";
import { capitalizeFirstLetter } from "src/util/misc";
import puppeteer from "puppeteer";

// ---------------------------------------------------------------------------
// Logo SOONA — chargé depuis le disque et converti en data-URI au démarrage
// ---------------------------------------------------------------------------
const LOGO_PATH = path.resolve(__dirname, "assets/soona-logo.png");
const LOGO_SRC = `data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString("base64")}`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function val(v: string | number | null | undefined, suffix = ""): string {
  if (v === null || v === undefined || v === "") return "—";
  return `${v}${suffix}`;
}

function montant(v: number | null | undefined): string {
  if (v === null || v === undefined) return "—";
  return `${v} €`;
}

// Génère une ligne <tr> avec label + valeur
function row(label: string, value: string): string {
  const isEmpty = value === "—";
  return `<tr>
    <td class="label">${label}</td>
    <td class="value${isEmpty ? " empty" : ""}">${value}</td>
  </tr>`;
}

// ---------------------------------------------------------------------------
// Template HTML
// ---------------------------------------------------------------------------

function buildHtml(demande: Demande, contact: Contact): string {
  const age =
    contact.age
      ? (new Date().getFullYear() - contact.age).toString()
      : "—";

  const adresse = [contact.adresse, contact.codePostal, contact.ville]
    .filter(Boolean)
    .join(" ") || "—";

  const conjointRow =
    demande.situationProConjoint
      ? row("Situation pro. du conjoint", capitalizeFirstLetter(demande.situationProConjoint))
      : "";

  const enfantsRows =
    demande.nombreEnfants && demande.nombreEnfants > 0
      ? row("Nombre d'enfants", demande.nombreEnfants.toString()) +
        (demande.agesEnfants ? row("Âges des enfants", demande.agesEnfants) : "")
      : "";

  return /* html */ `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 11pt;
      color: #1e293b;
      background: #ffffff;
      padding: 36px 48px 48px;
    }

    /* ── En-tête ───────────────────────────────────────────────── */
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #1a9bbc;
      padding-bottom: 16px;
      margin-bottom: 28px;
    }

    .header-logo img {
      height: 48px;
      width: auto;
      display: block;
    }

    .header-right {
      text-align: right;
    }

    .header-title {
      font-size: 18pt;
      font-weight: 700;
      color: #1a9bbc;
      letter-spacing: -0.3px;
    }

    .header-sub {
      font-size: 10pt;
      color: #64748b;
      margin-top: 3px;
    }

    .header-sub strong {
      color: #1e293b;
    }

    .badge {
      display: inline-block;
      background: #f0fbfd;
      color: #1a9bbc;
      border: 1px solid #a5d8e6;
      border-radius: 6px;
      padding: 2px 10px;
      font-size: 8.5pt;
      font-weight: 600;
      margin-top: 6px;
    }

    /* ── Section ───────────────────────────────────────────────── */
    .section {
      margin-bottom: 22px;
      break-inside: avoid;
    }

    .section-title {
      background: linear-gradient(90deg, #1a9bbc 0%, #2eb8d8 100%);
      color: #ffffff;
      font-size: 10.5pt;
      font-weight: 700;
      padding: 7px 14px;
      border-radius: 6px;
      margin-bottom: 10px;
      letter-spacing: 0.2px;
    }

    /* ── Table de données ──────────────────────────────────────── */
    table {
      width: 100%;
      border-collapse: collapse;
    }

    tr:nth-child(even) td {
      background: #f8fafc;
    }

    td {
      padding: 6px 10px;
      vertical-align: top;
      border-bottom: 1px solid #e2e8f0;
    }

    td.label {
      width: 42%;
      font-weight: 600;
      color: #334155;
      white-space: nowrap;
    }

    td.value {
      color: #1e293b;
    }

    td.value.empty {
      color: #94a3b8;
      font-style: italic;
    }

    /* ── Pied de page ──────────────────────────────────────────── */
    .footer {
      margin-top: 36px;
      border-top: 1px solid #e2e8f0;
      padding-top: 10px;
      font-size: 8.5pt;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
    }

    /* ── Page 2 ────────────────────────────────────────────────── */
    .page-break {
      page-break-before: always;
      padding-top: 36px;
    }

    .mission-title {
      font-size: 16pt;
      font-weight: 700;
      color: #1a9bbc;
      text-align: center;
      margin-bottom: 28px;
      letter-spacing: -0.3px;
    }

    .steps {
      list-style: none;
      margin-bottom: 32px;
    }

    .steps li {
      display: flex;
      align-items: flex-start;
      gap: 14px;
      padding: 10px 0;
      border-bottom: 1px solid #e2e8f0;
      font-size: 11pt;
      color: #1e293b;
      line-height: 1.5;
    }

    .steps li:last-child {
      border-bottom: none;
    }

    .step-num {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      background: linear-gradient(135deg, #1a9bbc, #2eb8d8);
      color: #fff;
      font-weight: 700;
      font-size: 11pt;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .practices-box {
      background: #f0fbfd;
      border-left: 4px solid #1a9bbc;
      border-radius: 0 8px 8px 0;
      padding: 16px 20px;
    }

    .practices-title {
      font-size: 11.5pt;
      font-weight: 700;
      color: #1a9bbc;
      margin-bottom: 12px;
    }

    .practices ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .practices ul li {
      padding: 5px 0;
      font-size: 11pt;
      color: #1e293b;
      display: flex;
      align-items: flex-start;
      gap: 8px;
      line-height: 1.5;
    }

    .practices ul li::before {
      content: '—';
      color: #1a9bbc;
      font-weight: 700;
      flex-shrink: 0;
    }
  </style>
</head>
<body>

  <!-- En-tête -->
  <div class="header">
    <div class="header-logo">
      <img src="${LOGO_SRC}" alt="SOONA" />
    </div>
    <div class="header-right">
      <div class="header-title">Fiche de demande</div>
      <div class="header-sub">Dossier N°&nbsp;<strong>${demande.id}</strong></div>
      <div class="header-sub">
        Généré le ${new Date().toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" })}
      </div>
      <span class="badge">Document confidentiel</span>
    </div>
  </div>

  <!-- 1. Identité et contact -->
  <div class="section">
    <div class="section-title">1. Identité et contact</div>
    <table>
      ${row("Numéro bénéficiaire", val(contact.id))}
      ${row("Nom", val(capitalizeFirstLetter(contact.nom)))}
      ${row("Prénom", val(capitalizeFirstLetter(contact.prenom)))}
      ${row("Âge", age)}
      ${row("Adresse", adresse)}
      ${row("Téléphone", val(contact.telephone))}
      ${row("E-mail", val(contact.email))}
    </table>
  </div>

  <!-- 3. Situation du foyer -->
  <div class="section">
    <div class="section-title">3. Situation du foyer</div>
    <table>
      ${row("Situation familiale", val(capitalizeFirstLetter(demande.situationFamiliale)))}
      ${row("Situation professionnelle", val(capitalizeFirstLetter(demande.situationProfessionnelle)))}
      ${conjointRow}
      ${enfantsRows}
    </table>
  </div>

  <!-- 4. Charges -->
  <div class="section">
    <div class="section-title">4. Charges</div>
    <table>
      ${row("Loyer", montant(demande.loyer))}
      ${row("Factures énergie", montant(demande.facturesEnergie))}
      ${row("Autres charges", montant(demande.autresCharges))}
      ${row("Dettes", montant(demande.dettes))}
      ${row("Nature des dettes", val(demande.natureDettes))}
    </table>
  </div>

  <!-- 5. Revenus -->
  <div class="section">
    <div class="section-title">5. Revenus</div>
    <table>
      ${row("APL", montant(demande.apl))}
      ${row("Revenus", montant(demande.revenus))}
      ${row("Revenus conjoint", montant(demande.revenusConjoint))}
      ${row("Autres aides", montant(demande.autresAides as unknown as number))}
    </table>
  </div>

  <!-- Pied de page -->
  <div class="footer">
    <span>Demande N° ${demande.id}</span>
    <span>Document généré automatiquement — usage interne uniquement</span>
  </div>

  <!-- ════════════════════════════════════════════════════════════ -->
  <!-- Page 2 — Mission bénévole                                   -->
  <!-- ════════════════════════════════════════════════════════════ -->
  <div class="page-break">

    <!-- En-tête page 2 -->
    <div class="header">
      <div class="header-logo">
        <img src="${LOGO_SRC}" alt="SOONA" />
      </div>
      <div class="header-right">
        <div class="header-title">Fiche de mission</div>
        <div class="header-sub">Dossier N°&nbsp;<strong>${demande.id}</strong></div>
      </div>
    </div>

    <div class="mission-title">Votre mission étape par étape</div>

    <ol class="steps">
      <li>
        <span class="step-num">1</span>
        <span>Répondez au mail reçu pour confirmer votre accord de réaliser la visite.</span>
      </li>
      <li>
        <span class="step-num">2</span>
        <span>Appelez le demandeur pour valider les informations et fixer une date de rendez-vous.</span>
      </li>
      <li>
        <span class="step-num">3</span>
        <span>Rappelez le demandeur la veille du rendez-vous pour vous assurer qu'il sera bien présent à son domicile à l'heure convenue.</span>
      </li>
      <li>
        <span class="step-num">4</span>
        <span>Demandez explicitement au demandeur la permission d'entrer dans son domicile pour mener à bien votre entretien.</span>
      </li>
      <li>
        <span class="step-num">5</span>
        <span>Discutez avec le demandeur et récupérez l'ensemble des informations requises par l'analyse de son dossier.</span>
      </li>
      <li>
        <span class="step-num">6</span>
        <span>Remerciez le demandeur et indiquez-lui que notre assistante reviendra vers lui prochainement pour le tenir au courant.</span>
      </li>
      <li>
        <span class="step-num">7</span>
        <span>Envoyez le compte rendu de votre visite à notre assistante afin qu'elle puisse soumettre le dossier au comité.</span>
      </li>
    </ol>

    <div class="practices-box practices">
      <div class="practices-title">Les bonnes pratiques</div>
      <ul>
        <li>Éviter le contact physique avec les demandeurs et les familles.</li>
        <li>Demander l'autorisation des demandeurs pour pénétrer dans leur domicile.</li>
        <li>Garder confidentielles les informations recueillies auprès des demandeurs.</li>
        <li>Masquer son numéro de téléphone pour appeler les demandeurs.</li>
        <li>Faire preuve de patience et de bienveillance autant que possible.</li>
      </ul>
    </div>

    <!-- Pied de page 2 -->
    <div class="footer">
      <span>Demande N° ${demande.id}</span>
      <span>Document généré automatiquement — usage interne uniquement</span>
    </div>

  </div>

</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Export principal
// ---------------------------------------------------------------------------

export async function generateDemandePdf(
  demande: Demande,
  contact: Contact,
  res: Response
): Promise<void> {
  const html = buildHtml(demande, contact);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0px", bottom: "0px", left: "0px", right: "0px" },
      displayHeaderFooter: true,
      headerTemplate: `<div></div>`,
      footerTemplate: `
        <div style="width:100%; font-size:8px; color:#94a3b8;
                    padding: 0 48px; display:flex; justify-content:space-between;">
          <span>Demande N° ${demande.id}</span>
          <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>`,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=demande-${demande.id}.pdf`
    );
    res.end(pdfBuffer);
  } finally {
    await browser.close();
  }
}
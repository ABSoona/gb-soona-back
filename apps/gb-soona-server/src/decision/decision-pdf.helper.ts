import * as fs from "fs";
import * as path from "path";
import { Response } from "express";
import puppeteer from "puppeteer";

// ---------------------------------------------------------------------------
// Logo SOONA - meme logo que demande-pdf.helper.ts
// ---------------------------------------------------------------------------
const LOGO_PATH = path.resolve(__dirname, "../../assets/soona-logo.png");
const LOGO_SRC = `data:image/png;base64,${fs.readFileSync(LOGO_PATH).toString("base64")}`;

interface OrganizationSettings {
  nom?: string | null;
  adresse?: string | null;
  rna?: string | null;
  email?: string | null;
  telephone?: string | null;
}

interface AideForPdf {
  montant: number | null;
  frequence: string | null;
  typeField: string | null;
  dateAide: Date | null;
  dateExpiration: Date | null;
  reetudier: boolean | null;
}

interface DecisionForPdf {
  id: number;
  motivation: string | null;
  createdAt: Date;
  comite: { date: Date };
  aides: AideForPdf[];
  demande: {
    id: number;
    contact: {
      nom: string | null;
      prenom: string | null;
      adresse: string | null;
      codePostal: number | null;
      ville: string | null;
      dateNaissance: Date | null;
    };
  };
  situationHistory: {
    situationFamiliale: string | null;
    situationProfessionnelle: string | null;
    nombreEnfants: number | null;
    nombrePersonnes: number | null;
    revenus: number | null;
    revenusConjoint: number | null;
    apl: number | null;
    autresAides: string | null;
    loyer: number | null;
    facturesEnergie: number | null;
    autresCharges: number | null;
    dettes: number | null;
    natureDettes: string | null;
  };
}

// ---------------------------------------------------------------------------
// Traductions des valeurs brutes (enums/snake_case) en texte naturel
// ---------------------------------------------------------------------------

const SITUATION_FAMILIALE_LABELS: Record<string, string> = {
  "marié": "marié(e)",
  "divorcé": "divorcé(e)",
  "veuf": "veuf(ve)",
  "célibataire": "célibataire",
};

const SITUATION_PRO_LABELS: Record<string, string> = {
  "sans_emploi": "sans emploi",
  "employé": "salarié(e)",
  "indépendant": "travailleur(se) indépendant(e)",
  "retraité": "retraité(e)",
};

const FREQUENCE_LABELS: Record<string, string> = {
  Mensuelle: "mensuelle",
  BiMensuelle: "bimensuelle",
  Trimestrielle: "trimestrielle",
  Hebdomadaire: "hebdomadaire",
  Unefois: "ponctuelle",
};

function situationFamilialeLabel(v: string | null): string | null {
  if (!v || v === "Inconnu") return null;
  return SITUATION_FAMILIALE_LABELS[v] ?? v;
}

function situationProLabel(v: string | null): string | null {
  if (!v || v === "Inconnu") return null;
  return SITUATION_PRO_LABELS[v] ?? v;
}

function eur(v: number | null | undefined): string {
  return `${(v ?? 0).toLocaleString("fr-FR")} €`;
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return null as unknown as string;
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function describeAide(aide: AideForPdf): string {
  if (aide.typeField === "AssistanceAdministrative") {
    const fin = aide.dateExpiration ? ` jusqu'au ${formatDate(aide.dateExpiration)}` : "";
    return `une assistance administrative${fin}`;
  }
  let freqLabel = aide.frequence ? FREQUENCE_LABELS[aide.frequence] ?? aide.frequence : "";
  if (aide.frequence === "Mensuelle" && aide.reetudier) {
    freqLabel = `${freqLabel} renouvelable`;
  }
  if (aide.frequence === "Unefois") {
    return `une aide ponctuelle de ${eur(aide.montant)}, versée à partir du ${formatDate(aide.dateAide)}`;
  }
  const fin = aide.dateExpiration ? ` jusqu'au ${formatDate(aide.dateExpiration)}` : "";
  return `une aide ${freqLabel} de ${eur(aide.montant)}, à compter du ${formatDate(aide.dateAide)}${fin}`;
}

function joinFrench(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

// ---------------------------------------------------------------------------
// Construction du paragraphe de situation, en texte continu (et non en
// tableau), a la demande de l'equipe - voir conversation produit.
// ---------------------------------------------------------------------------
function buildSituationParagraphe(s: DecisionForPdf["situationHistory"], nomComplet: string): string {
  const clausesIdentite: string[] = [];
  const famille = situationFamilialeLabel(s.situationFamiliale);
  const pro = situationProLabel(s.situationProfessionnelle);
  if (famille) clausesIdentite.push(famille);
  if (pro) clausesIdentite.push(pro);
  if (s.nombreEnfants && s.nombreEnfants > 0) {
    clausesIdentite.push(`${s.nombreEnfants} enfant${s.nombreEnfants > 1 ? "s" : ""} à charge`);
  }
  const identite = clausesIdentite.length > 0 ? ` (${joinFrench(clausesIdentite)})` : "";

  const totalRevenus = (s.revenus ?? 0) + (s.revenusConjoint ?? 0) + (s.apl ?? 0);
  const totalCharges = (s.loyer ?? 0) + (s.facturesEnergie ?? 0) + (s.autresCharges ?? 0);
  const resteAVivre = totalRevenus - totalCharges;
  const resteAVivreParPersonne =
    resteAVivre > 0 && s.nombrePersonnes ? resteAVivre / s.nombrePersonnes / 30 : null;

  const detteClause =
    s.dettes && s.dettes > 0
      ? ` et une dette de ${eur(s.dettes)}${s.natureDettes ? ` (${s.natureDettes})` : ""}`
      : "";

  // 1ere phrase : chiffres de synthese (charges, revenus, reste a vivre, dettes).
  const synthese = `Compte tenu de la situation de <strong>${nomComplet}</strong>${identite}, le foyer dispose de revenus de ${eur(totalRevenus)} par mois pour des charges de ${eur(totalCharges)} par mois, soit un reste à vivre estimé à <strong>${eur(resteAVivre)}</strong> par mois${resteAVivreParPersonne !== null ? ` (environ ${resteAVivreParPersonne.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} € par jour et par personne)` : ""}${detteClause}.`;

  // 2e phrase : detail de la composition des charges.
  const chargesClauses: string[] = [];
  if (s.loyer) chargesClauses.push(`${eur(s.loyer)} de loyer`);
  if (s.facturesEnergie) chargesClauses.push(`${eur(s.facturesEnergie)} de factures d'énergie`);
  if (s.autresCharges) chargesClauses.push(`${eur(s.autresCharges)} de charges diverses`);
  const detailCharges =
    chargesClauses.length > 0
      ? ` Ces charges se décomposent comme suit : ${joinFrench(chargesClauses)} par mois.`
      : "";

  return `${synthese}${detailCharges}`;
}

function buildHtml(decision: DecisionForPdf, org: OrganizationSettings): string {
  const contact = decision.demande.contact;
  const nomComplet = `${contact.prenom ?? ""} ${contact.nom ?? ""}`.trim() || "-";
  const adresse = [contact.adresse, contact.codePostal, contact.ville].filter(Boolean).join(" ");
  const naissanceClause = contact.dateNaissance ? `, né(e) le ${formatDate(contact.dateNaissance)}` : "";
  const dateComite = formatDate(decision.comite.date);
  const s = decision.situationHistory;

  const aidesClause =
    decision.aides.length > 0
      ? joinFrench(decision.aides.map(describeAide))
      : "une aide (détail à préciser)";

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

    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 3px solid #1a9bbc;
      padding-bottom: 16px;
      margin-bottom: 28px;
    }

    .header-logo img { height: 48px; width: auto; display: block; }

    .header-right { text-align: right; }

    .header-title {
      font-size: 16pt;
      font-weight: 700;
      color: #1a9bbc;
      letter-spacing: -0.3px;
    }

    .header-sub { font-size: 9pt; color: #64748b; margin-top: 2px; }

    .decision-title {
      font-size: 15pt;
      font-weight: 700;
      color: #1e293b;
      text-align: center;
      margin-bottom: 4px;
    }

    .decision-ref {
      text-align: center;
      font-size: 9.5pt;
      color: #64748b;
      margin-bottom: 72px;
    }

    .paragraph {
      line-height: 1.8;
      margin-bottom: 18px;
      text-align: justify;
    }

    .signature {
      margin-top: 56px;
      display: flex;
      justify-content: flex-end;
    }

    .signature-block {
      text-align: center;
      width: 260px;
    }

    .signature-line {
      margin-top: 48px;
      border-top: 1px solid #94a3b8;
      padding-top: 6px;
      font-size: 9pt;
      color: #64748b;
    }
  </style>
</head>
<body>

  <div class="header">
    <div class="header-logo">
      <img src="${LOGO_SRC}" alt="SOONA" />
    </div>
    <div class="header-right">
      <div class="header-title">${org.nom ?? ""}</div>
      <div class="header-sub">${org.adresse ?? ""}</div>
      <div class="header-sub">RNA&nbsp;${org.rna ?? ""}</div>
      <div class="header-sub">${org.email ?? ""} - ${org.telephone ?? ""}</div>
    </div>
  </div>

  <div class="decision-title">Compte rendu de décision du comité Z.A.M</div>
  <div class="decision-ref">Comité du ${dateComite} - Dossier n°&nbsp;${decision.demande.id} - Décision n°&nbsp;${decision.id}</div>

  <div class="paragraph">
    Le comité Z.A.M de ${org.nom ?? "l'association"}, réuni le <strong>${dateComite}</strong>,
    a examiné le dossier de <strong>${nomComplet}</strong>${naissanceClause}${adresse ? `, domicilié(e) ${adresse}` : ""},
    enregistré sous le n°&nbsp;${decision.demande.id}, et dont la pièce d'identité est ci-jointe.
  </div>

  <div class="paragraph">
    ${buildSituationParagraphe(s, nomComplet)}
  </div>

  <div class="paragraph">
    Au regard de cette situation, le comité a décidé d'accorder à <strong>${nomComplet}</strong> ${aidesClause}.
  </div>

  <div class="signature">
    <div class="signature-block">
      <div>Pour le comité</div>
      <div class="signature-line">Signature</div>
    </div>
  </div>

</body>
</html>`;
}

export async function generateDecisionPdf(
  decision: DecisionForPdf,
  organizationSettings: OrganizationSettings,
  res: Response
): Promise<void> {
  const html = buildHtml(decision, organizationSettings);

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
          <span>Décision N° ${decision.id}</span>
          <span>Page <span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>`,
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=decision-${decision.id}.pdf`);
    res.end(pdfBuffer);
  } finally {
    await browser.close();
  }
}

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

// ---------------------------------------------------------------------------
// Conversion d'un montant en toutes lettres (francais standard), pour les
// aides accordees dans le compte rendu - ex: 400 -> "quatre cents".
// ---------------------------------------------------------------------------
const UNITS = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf", "dix",
  "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
const TENS = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"];

function convertBelowThousand(num: number): string {
  if (num === 0) return "";
  if (num < 20) return UNITS[num];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const unit = num % 10;
    if (ten === 7 || ten === 9) {
      const base = ten === 7 ? "soixante" : "quatre-vingt";
      return unit === 0 ? `${base}-dix` : `${base}-${UNITS[10 + unit]}`;
    }
    if (ten === 8) {
      return unit === 0 ? "quatre-vingts" : `quatre-vingt-${UNITS[unit]}`;
    }
    if (unit === 0) return TENS[ten];
    if (unit === 1) return `${TENS[ten]}-et-un`;
    return `${TENS[ten]}-${UNITS[unit]}`;
  }
  const hundred = Math.floor(num / 100);
  const rest = num % 100;
  let str = hundred === 1 ? "cent" : `${UNITS[hundred]} cent`;
  if (rest === 0 && hundred > 1) str += "s";
  if (rest > 0) str += ` ${convertBelowThousand(rest)}`;
  return str;
}

function numberToFrenchWords(n: number): string {
  if (n === 0) return "zéro";
  if (n < 0) return `moins ${numberToFrenchWords(-n)}`;

  const parts: string[] = [];
  const millions = Math.floor(n / 1000000);
  const thousands = Math.floor((n % 1000000) / 1000);
  const remainder = n % 1000;

  if (millions > 0) {
    parts.push(millions === 1 ? "un million" : `${convertBelowThousand(millions)} millions`);
  }
  if (thousands > 0) {
    parts.push(thousands === 1 ? "mille" : `${convertBelowThousand(thousands)} mille`);
  }
  if (remainder > 0) {
    parts.push(convertBelowThousand(remainder));
  }
  return parts.join(" ").trim();
}

// Combine toutes-lettres + chiffres, ex: "quatre cents euros (400 €)". Si le
// montant n'est pas un nombre entier (rare pour une aide), on reste sur les
// chiffres pour eviter d'inventer une ecriture des centimes en lettres.
function montantEnLettres(v: number | null | undefined): string {
  const montant = v ?? 0;
  if (!Number.isInteger(montant)) {
    return eur(montant);
  }
  const mot = montant <= 1 ? "un euro" : `${numberToFrenchWords(montant)} euros`;
  return `${mot} (${eur(montant)})`;
}

function formatDate(d: Date | string | null | undefined): string {
  if (!d) return null as unknown as string;
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

function describeAide(aide: AideForPdf): string {
  if (aide.typeField === "AssistanceAdministrative") {
    const fin = aide.dateExpiration ? ` jusqu'au ${formatDate(aide.dateExpiration)}` : "";
    return `Une assistance administrative${fin}.`;
  }
  let freqLabel = aide.frequence ? FREQUENCE_LABELS[aide.frequence] ?? aide.frequence : "";
  if (aide.frequence === "Mensuelle" && aide.reetudier) {
    freqLabel = `${freqLabel} renouvelable`;
  }
  if (aide.frequence === "Unefois") {
    return `Une aide ponctuelle de ${montantEnLettres(aide.montant)}, versée à partir du ${formatDate(aide.dateAide)}.`;
  }
  const fin = aide.dateExpiration ? ` jusqu'au ${formatDate(aide.dateExpiration)}` : "";
  return `Une aide ${freqLabel} de ${montantEnLettres(aide.montant)}, à compter du ${formatDate(aide.dateAide)}${fin}.`;
}

function joinFrench(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

// ---------------------------------------------------------------------------
// Construction de la liste a puces "{Nom} declare etre :" (situation,
// revenus/charges/reste a vivre, dettes, detail des charges en sous-liste).
// ---------------------------------------------------------------------------
function buildSituationItems(s: DecisionForPdf["situationHistory"]): string[] {
  const items: string[] = [];

  const clausesIdentite: string[] = [];
  const famille = situationFamilialeLabel(s.situationFamiliale);
  const pro = situationProLabel(s.situationProfessionnelle);
  if (famille) clausesIdentite.push(famille);
  if (pro) clausesIdentite.push(pro);
  if (s.nombreEnfants && s.nombreEnfants > 0) {
    clausesIdentite.push(`${s.nombreEnfants} enfant${s.nombreEnfants > 1 ? "s" : ""} à charge`);
  }
  if (clausesIdentite.length > 0) {
    items.push(`${capitalize(joinFrench(clausesIdentite))}.`);
  }

  const totalRevenus = (s.revenus ?? 0) + (s.revenusConjoint ?? 0) + (s.apl ?? 0);
  const totalCharges = (s.loyer ?? 0) + (s.facturesEnergie ?? 0) + (s.autresCharges ?? 0);
  const resteAVivre = totalRevenus - totalCharges;
  const resteAVivreParPersonne =
    resteAVivre > 0 && s.nombrePersonnes ? resteAVivre / s.nombrePersonnes / 30 : null;

  items.push(
    `Dispose de revenus de ${eur(totalRevenus)} par mois pour des charges de ${eur(totalCharges)} par mois, soit un reste à vivre estimé à <strong>${eur(resteAVivre)}</strong> par mois${resteAVivreParPersonne !== null ? ` (environ ${resteAVivreParPersonne.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} € par jour et par personne)` : ""}.`
  );

  if (s.dettes && s.dettes > 0) {
    items.push(`Une dette de ${eur(s.dettes)}${s.natureDettes ? ` (${s.natureDettes})` : ""}.`);
  }

  const chargesSubItems: string[] = [];
  if (s.loyer) chargesSubItems.push(`${eur(s.loyer)} de loyer.`);
  if (s.facturesEnergie) chargesSubItems.push(`${eur(s.facturesEnergie)} de factures d'énergie.`);
  if (s.autresCharges) chargesSubItems.push(`${eur(s.autresCharges)} de charges diverses par mois.`);
  if (chargesSubItems.length > 0) {
    const sousListe = `<ul class="sub-list">${chargesSubItems.map((c) => `<li>${c}</li>`).join("")}</ul>`;
    items.push(`Ces charges se décomposent comme suit :${sousListe}`);
  }

  return items;
}

function capitalize(s: string): string {
  return s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

function buildHtml(decision: DecisionForPdf, org: OrganizationSettings): string {
  const contact = decision.demande.contact;
  const nomComplet = `${contact.prenom ?? ""} ${contact.nom ?? ""}`.trim() || "-";
  const adresse = [contact.adresse, contact.codePostal, contact.ville].filter(Boolean).join(" ");
  const naissanceClause = contact.dateNaissance ? `, né(e) le ${formatDate(contact.dateNaissance)}` : "";
  const dateComite = formatDate(decision.comite.date);
  const s = decision.situationHistory;

  const situationItems = buildSituationItems(s);
  const aideItems = decision.aides.length > 0
    ? decision.aides.map(describeAide)
    : ["Une aide (détail à préciser)."];

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

    .section-heading {
      margin-bottom: 10px;
    }

    ul.main-list {
      margin: 0 0 18px 0;
      padding-left: 22px;
      line-height: 1.7;
    }

    ul.main-list > li {
      margin-bottom: 8px;
    }

    ul.sub-list {
      margin: 6px 0 0 0;
      padding-left: 22px;
      list-style-type: circle;
    }

    ul.sub-list > li {
      margin-bottom: 4px;
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

  <div class="section-heading"><strong>${nomComplet}</strong> déclare être :</div>
  <ul class="main-list">
    ${situationItems.map((item) => `<li>${item}</li>`).join("")}
  </ul>

  <div class="section-heading">Au regard de cette situation, le comité a décidé d'accorder à <strong>${nomComplet}</strong> :</div>
  <ul class="main-list">
    ${aideItems.map((item) => `<li>${item}</li>`).join("")}
  </ul>

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

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import csv from 'csv-parser';
import readline from 'readline';
import { parse } from 'date-fns';
import { fr } from 'date-fns/locale';
const prisma = new PrismaClient();

interface CsvRow {
  [key: string]: string;
  Nom: string;
  Prénom: string;
  'N°': string;
  DateDemande: string;
}

function isEmptyAideCell(value?: string): boolean {
    if (value == null) return true;
    const v = value.replace(/\u00A0/g, ' ').trim().toLowerCase(); // retire NBSP
    // Exemples vides du fichier : "-", "-    €", "—", "", "na", "n/a"
    const vNoEuro = v.replace(/€/g, '').trim();
    return (
      vNoEuro === '' ||
      vNoEuro === '-' ||
      vNoEuro === '—' ||
      vNoEuro === 'na' ||
      vNoEuro === 'n/a'
    );
  }
  
  function parseFrDateToUTC(value?: string): Date | null {
    if (!value) return null;
    const v = value.replace(/\u00A0/g, ' ').trim();     // nettoie NBSP
    const d = parse(v, 'dd/MM/yyyy', new Date(), { locale: fr });
    if (isNaN(d.getTime())) return null;
    // ⚠️ fige au début du jour en UTC pour éviter les décalages
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  }
  function parseMontantFR(value: string | undefined): number | null {
    if (isEmptyAideCell(value)) return null;
  
    // Nettoyage : enlever NBSP, euro, tout sauf chiffres, séparateurs et signe
    let s = value!.replace(/\u00A0/g, ' ');         // NBSP -> espace
    s = s.replace(/€/g, '');                         // retire €
    s = s.replace(/\s+/g, '');                       // retire tous les espaces
    // Ne garder que [0-9 , . -]
    s = s.replace(/[^\d,.\-]/g, '');
  
    // Cas "1.050,00" vs "1,050.00" – on choisit convention FR : virgule = décimal
    // -> remplacer la virgule décimale par un point, supprimer les points milliers
    // Approche simple : si la chaîne contient une virgule, on considère que c'est la décimale.
    if (s.includes(',')) {
      s = s.replace(/\./g, '');  // points -> milliers
      s = s.replace(',', '.');   // virgule -> décimal
    }
  
    const num = Number(s);
    return Number.isFinite(num) ? num : null;
  }

async function askYesNo(question: string, def: 'y' | 'n' = 'n'): Promise<boolean> {
  // flags CLI
  const args = process.argv.slice(2);
  if (args.includes('--reset')) return true;
  if (args.includes('--no-reset')) return false;

  // prompt interactif si TTY
  if (!process.stdin.isTTY) return def === 'y';

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const suffix = def === 'y' ? ' [Y/n] ' : ' [y/N] ';
  const answer: string = await new Promise((resolve) => rl.question(question + suffix, resolve));
  rl.close();

  const a = answer.trim().toLowerCase();
  if (!a) return def === 'y';
  return ['y', 'yes', 'o', 'oui'].includes(a);
}

async function maybeReset(): Promise<void> {
  const doReset = await askYesNo('Voulez-vous supprimer TOUTES les demandes et aides avant import ?', 'n');
  if (!doReset) {
    console.log('➡️  Réinitialisation ignorée.');
    return;
  }

  console.log('🧹 Suppression des données existantes (Aides, puis Demandes)…');
  // Aides d'abord (FK), puis Demandes
  await prisma.$transaction([
    prisma.aide.deleteMany({}),
    prisma.demande.deleteMany({}),
  ]);
  console.log('✅ Données supprimées.');
}

async function main() {
  const inputFile = '/app/scripts/data/demandes-aides.csv';
  const rows: CsvRow[] = [];

  await maybeReset();

  console.log('📥 Lecture du fichier CSV…');
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(inputFile)
      .pipe(csv({ separator: ';' }))
      .on('data', (row: CsvRow) => rows.push(row))
      .on('end', resolve)
      .on('error', reject);
  });
  console.log(`✅ ${rows.length} lignes lues.`);

  let createdDemandes = 0;
  let createdAides = 0;
  let skipped = 0;

  for (const row of rows) {
    const numero = (row['N°'] || '').trim();
    if (!numero) {
      console.warn('⚠️ Ligne ignorée (pas de numéro) :', row);
      skipped++;
      continue;
    }

    // 🔎 Contact
    const contact = await prisma.contact.findFirst({ where: { id:Number(numero) } });
    if (!contact) {
      console.warn(`⚠️ Aucun contact trouvé pour le numéro ${numero}`);
      skipped++;
      continue;
    }

    // 📅 Date de la demande (et createdAt)
    const rawDate = row['Date de la demande']; // nom exact de ta colonne
    let dateDemande = parseFrDateToUTC(rawDate);


    // 🧱 Demande avec valeurs par défaut
    const demande = await prisma.demande.create({
      data: {
        
        contactId: contact.id,
        agesEnfants: 'Inconnu',
        apl: 0,
        autresAides: 'Inconnu',
        autresCharges: 0,
        dettes: 0,
        facturesEnergie: 0,
        loyer: 0,
        natureDettes: 'Inconnu',
        nombreRelances: 0,
        recommandation: 'Inconnu',
        remarques: "Demande importée lors de l'initialisation",
        revenus: 0,
        revenusConjoint: 0,
        situationFamiliale: 'Inconnue',
        situationProConjoint: 'Inconnue',
        situationProfessionnelle: 'Inconnue',
        status: 'clôturée',
        createdAt: dateDemande,
      },
    });
    createdDemandes++;

    // 🔎 Colonnes "Aide XXXX" -> Aides (pas de champ `annee`)
    const aideKeys = Object.keys(row).filter((k) => /^Aide\s*\d{4}$/.test(k));

    for (const key of aideKeys) {
      if (isEmptyAideCell(row[key])) continue;

      const montantParsed = parseMontantFR(row[key]);
      if (montantParsed === null || montantParsed === 0) continue;

      const yearStr = key.replace('Aide', '').trim();
      const year = parseInt(yearStr, 10);
      if (!Number.isFinite(year)) continue;

      const dateAide = new Date(year, 0, 1); // 1er janvier de l’année

      await prisma.aide.create({
        data: {
          montant: montantParsed,
          demandeId: demande.id,
          contactId: contact.id,
          crediteur: 'LeBNFiciaire' as any,
          dateAide,
          frequence: 'Unefois' as any,
          nombreVersements: 1,
          remarque: "Aide importée lors de l'initialisation",
          status: 'Expir' as any,
          suspendue: false,
          typeField: 'FinanciRe' as any,
        },
      });
      createdAides++;
    }
  }

  console.log('🎯 Import terminé.');
  console.log(`📌 ${createdDemandes} demandes créées`);
  console.log(`💰 ${createdAides} aides créées`);
  console.log(`🚫 ${skipped} lignes ignorées`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur pendant l’import :', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

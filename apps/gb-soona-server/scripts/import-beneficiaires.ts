// scripts/import-beneficiaires.ts
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import csv from 'csv-parser';
import readline from 'readline';


const prisma = new PrismaClient();

interface BeneficiaireRow {
  ['N°']: string;
  Nom: string;
  ['Prénom']: string;
  Age: string;
  Email: string;
  Tel: string;
  Adresse: string;
  Ville: string;
  ['Black listé']: string;
  ['Date de naissance']:string;
  ['Date de la demande']:string
}

function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    }),
  );
}

async function resyncSequence(table: string) {
  await prisma.$executeRawUnsafe(`
    SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), (SELECT MAX(id) FROM "${table}"));
  `);
  console.log(`🔁 Séquence ${table}.id resynchronisée`);
}

async function importContacts() {
  const filePath = '/data/scripts/data/contacts.csv';

  console.log('📥 Lecture du fichier contacts.csv...');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Fichier introuvable : ${filePath}`);
    process.exit(1);
  }

  const answer = await askQuestion(
    '⚠️  Voulez-vous supprimer tous les contacts leur aides et demandes existants avant import ? (o/n) : ',
  );

  if (answer.toLowerCase().startsWith('o')) {
    await prisma.versement.deleteMany({});
    await prisma.aide.deleteMany({});
    await prisma.demande.deleteMany({});
    await prisma.visite?.deleteMany({});
    const deleted = await prisma.contact.deleteMany();
    console.log(`🗑️  ${deleted.count} contacts supprimés.`);
  } else {
    console.log('⏩  Import sans suppression des données existantes.');
  }

  const contacts: BeneficiaireRow[] = [];
  fs.createReadStream(filePath)
    .pipe(csv({ separator: ',' })) // adapte le séparateur si besoin
    .on('data', (data: BeneficiaireRow) => contacts.push(data))
    .on('end', async () => {
      console.log(`📄 ${contacts.length} lignes lues.`);

      let success = 0;
      let errors = 0;

      for (const row of contacts) {
        try {
          const id = Number(row['N°']);
          const nom = row.Nom?.trim() || null;
          const prenom = row['Prénom']?.trim() || null;
          const email = row.Email?.trim() || null;
          const telephone = row.Tel?.trim() || null;
          const adresse = row.Adresse?.trim() || null;
          const ville = row.Ville?.trim() || null;
          const age = row.Age ? Number(row.Age) : null;
          const dateNaissance = parseDate(row['Date de naissance']);
          
          const createdAt =
  row['Date de la demande'] && row['Date de la demande'].trim() !== ""
    ? parseDate(row['Date de la demande']) || new Date()  // fallback ici
    : new Date();

          const blackListe = row['Black listé']?.trim().toUpperCase() === 'OUI';
          const status = blackListe ? 'blacklisté' : 'active';
          await prisma.contact.create({
            data: {
              id,              
              nom,              
              prenom,
              email,              
              telephone,              
              adresse,              
              ville,              
              age,
              dateNaissance,          
              status,
              createdAt
            },
          });

          success++;
        } catch (e: any) {
          errors++;
          console.error(`❌ Erreur sur la ligne ${row['N°']} (${row.Nom}): ${e.message}`);
        }
      }

      console.log(`✅ Import terminé : ${success} réussis, ${errors} erreurs`);

      await resyncSequence('Contact');

      await prisma.$disconnect();
    });
}

function parseDate(value: string | null): Date | null {
  if (!value) return null;

  // format européen dd/mm/yyyy
  if (value.includes('/')) {
    const [day, month, year] = value.split('/');
    return new Date(Number(year), Number(month) - 1, Number(day));
  }

  // format ISO ou autre → laisser JS gérer
  return new Date(value);
}

importContacts();

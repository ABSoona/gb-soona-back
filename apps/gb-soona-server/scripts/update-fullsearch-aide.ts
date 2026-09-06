import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fonction helper pour construire le champ flattened (identique a celle de update-fullsearch.ts)
function buildFullSearch(contact: any): string {
  const nom = contact?.nom?.trim() ?? '';
  const prenom = contact?.prenom?.trim() ?? '';
  const email = contact?.email?.trim() ?? '';
  const telephone = contact?.telephone?.trim() ?? '';

  const departement = contact?.codePostal
    ? contact.codePostal.toString().slice(0, 2)
    : '';

  return [
    `${nom} ${prenom}`.trim(),
    `${prenom} ${nom}`.trim(),
    departement,
    email,
    telephone,
  ]
    .filter(Boolean)
    .join(', ');
}

async function main() {
  console.log('🚀 Mise à jour du champ fullSearch pour toutes les aides…');

  const aides = await prisma.aide.findMany({
    include: { contact: true },
  });

  console.log(`📌 ${aides.length} aides trouvées.`);

  for (const aide of aides) {
    const contact = aide.contact;

    if (!contact) {
      console.warn(`⚠️ Aide ${aide.id} sans contact -> ignorée`);
      continue;
    }

    const fullSearch = buildFullSearch(contact);

    await prisma.aide.update({
      where: { id: aide.id },
      data: { fullSearch },
    });
  }

  console.log('🎉 Terminé ! Tous les fullSearch ont été mis à jour.');
}

main()
  .catch((e) => {
    console.error('❌ Erreur :', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

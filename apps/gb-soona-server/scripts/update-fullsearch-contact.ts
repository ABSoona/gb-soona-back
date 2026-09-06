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
  console.log('🚀 Mise à jour du champ fullSearch pour tous les contacts…');

  const contacts = await prisma.contact.findMany();

  console.log(`📌 ${contacts.length} contacts trouvés.`);

  for (const contact of contacts) {
    const fullSearch = buildFullSearch(contact);

    await prisma.contact.update({
      where: { id: contact.id },
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

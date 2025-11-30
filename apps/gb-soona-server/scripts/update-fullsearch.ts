import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Fonction helper pour construire le champ flattened
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
  console.log('🚀 Mise à jour du champ fullSearch pour toutes les demandes…');

  // Charger toutes les demandes + contacts associés
  const demandes = await prisma.demande.findMany({
    include: { contact: true },
  });

  console.log(`📌 ${demandes.length} demandes trouvées.`);

  for (const demande of demandes) {
    const contact = demande.contact;

    if (!contact) {
      console.warn(`⚠️ Demande ${demande.id} sans contact -> ignorée`);
      continue;
    }

    const fullSearch = buildFullSearch(contact);

    await prisma.demande.update({
      where: { id: demande.id },
      data: { fullSearch },
    });

    console.log(`✔ fullSearch mis à jour pour demande ${demande.id}`);
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

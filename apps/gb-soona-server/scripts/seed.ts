import { Aide } from './../node_modules/.prisma/client/index.d';
import * as dotenv from "dotenv";
import { EnumTypeDocumentRattachement, PrismaClient } from "@prisma/client";
import { customSeed } from "./customSeed";
import { Salt, parseSalt } from "../src/auth/password.service";
import { hash } from "bcrypt";

if (require.main === module) {
  dotenv.config();

  const { BCRYPT_SALT } = process.env;

  if (!BCRYPT_SALT) {
    throw new Error("BCRYPT_SALT environment variable must be defined");
  }
  const salt = parseSalt(BCRYPT_SALT);

  seed(salt).catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

async function seed(bcryptSalt: Salt) {
  console.info("Seeding database...");

  const client = new PrismaClient();

  const data = {
    username : "gb@soona.fr",
    email : "gb@soona.fr",
    firstName : "admin",
    lastName : "admin",
    status : "active",
    roles : ["admin"],
    role : "admin",
    password: await hash("admin", bcryptSalt),

  };


  await client.user.upsert({
    where: {
      username: data.username,
    },

    update: {},
    create: data,
  });

  

  const wpApiPass = process.env.WP_API_PASS;
if (!wpApiPass) {
  throw new Error("WP_API_PASS environment variable must be defined");
}

  const apiUser = {
    username: "wordpress@soona.fr",
    email: "wordpress@soona.fr",
    firstName : "wordpress",
    lastName : "api",
    status : "active",
    password: await hash(wpApiPass, bcryptSalt),
    roles: ["admin"],
    role: "admin",
  };

  await client.user.upsert({
    where: {
      username: apiUser.username,
    },

    update:  {},
    create: apiUser,
  });

  // Compte de service pour Fitra (plateforme inter-associative de zakat
  // al-fitr) : role en lecture seule, voir src/grants.json. Le mot de passe
  // n'est jamais ecrit dans le depot : si FITRA_API_PASSWORD n'est pas
  // defini (ex: poste de dev sans besoin de ce compte), on saute sa creation.
  const fitraApiPass = process.env.FITRA_API_PASSWORD;
  if (fitraApiPass) {
    const fitraUser = {
      username: "fitra",
      email: "fitra@soona.fr",
      firstName: "Fitra",
      lastName: "(compte de service)",
      status: "active",
      password: await hash(fitraApiPass, bcryptSalt),
      roles: ["fitra"],
      role: "fitra",
    };

    await client.user.upsert({
      where: {
        username: fitraUser.username,
      },

      update: {},
      create: fitraUser,
    });
  } else {
    console.info(
      "FITRA_API_PASSWORD non defini : le compte de service 'fitra' n'a pas ete cree."
    );
  }

  const internalTypes = [
    { label: "Rapport de visite", internalCode: "rapport_visite",isInternal: true,rattachement: EnumTypeDocumentRattachement.Suivi},
    { label: "Autre document de suivi", internalCode: "autre_suivi",isInternal: false,rattachement:EnumTypeDocumentRattachement.Suivi },
    { label: "Preuve de virement", internalCode: "preuve_virement",isInternal: true,rattachement:EnumTypeDocumentRattachement.Aide },
    { label: "Rib", internalCode: "rib",isInternal: true,rattachement:EnumTypeDocumentRattachement.Contact },
    { label: "Type inconnu", internalCode: "unknown_suivi",isInternal: true,rattachement:EnumTypeDocumentRattachement.Suivi },
    { label: "Type inconnu", internalCode: "unknown_contact",isInternal: true,rattachement:EnumTypeDocumentRattachement.Contact },
    { label: "Type inconnu", internalCode: "unknown_aide",isInternal: true,rattachement:EnumTypeDocumentRattachement.Aide },
    { label: "Type inconnu", internalCode: "unknown_demande",isInternal: true,rattachement:EnumTypeDocumentRattachement.Demande },
    
  ];

  for (const doc of internalTypes) {
    await client.typeDocument.upsert({
      where: { internalCode: doc.internalCode },
      update: {},
      create: {
        label: doc.label,
        internalCode: doc.internalCode,
        isInternal: doc.isInternal,
        rattachement: doc.rattachement,
      },
    });
  }
  void client.$disconnect();

  console.info("Seeding database with custom seed...");
  customSeed();

  console.info("database Seeded successfully");
}

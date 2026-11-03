// Cree (ou met a jour le mot de passe de) le compte de service "fitra",
// sans toucher a aucune autre donnee (contrairement a seed.ts, qui cree
// aussi le compte admin, le compte wordpress et les TypeDocument internes,
// et qui exige WP_API_PASS).
//
// Usage :
//   PowerShell : $env:FITRA_API_PASSWORD='<mot de passe long>'; npm run create:fitra-user
//   bash       : FITRA_API_PASSWORD='<mot de passe long>' npm run create:fitra-user
//
// Idempotent : si le compte existe deja, seul le mot de passe est
// re-haches et mis a jour (pour une rotation), rien d'autre n'est touche.
import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { Salt, parseSalt } from "../src/auth/password.service";
import { hash } from "bcrypt";

async function main() {
  dotenv.config();

  const { BCRYPT_SALT, FITRA_API_PASSWORD } = process.env;

  if (!BCRYPT_SALT) {
    throw new Error("BCRYPT_SALT environment variable must be defined");
  }
  if (!FITRA_API_PASSWORD) {
    throw new Error("FITRA_API_PASSWORD environment variable must be defined");
  }

  const salt: Salt = parseSalt(BCRYPT_SALT);
  const client = new PrismaClient();

  const hashedPassword = await hash(FITRA_API_PASSWORD, salt);

  const user = await client.user.upsert({
    where: { username: "fitra" },
    update: { password: hashedPassword },
    create: {
      username: "fitra",
      email: "fitra@soona.fr",
      firstName: "Fitra",
      lastName: "(compte de service)",
      status: "active",
      password: hashedPassword,
      roles: ["fitra"],
      role: "fitra",
    },
  });

  console.info(`Compte de service 'fitra' pret (id=${user.id}).`);
  await client.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

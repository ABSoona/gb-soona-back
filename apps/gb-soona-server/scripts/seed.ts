import * as dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
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
    username: "admin",
    password: await hash("admin", bcryptSalt),
    roles: ["user"],
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
    username: "wordpress",
    email: "gb@soona.fr",
    firstName : "wordpress",
    lastName : "api",
    status : "active",
    password: await hash(wpApiPass, bcryptSalt),
    roles: ["user"],
    role: "admin",
  };

  await client.user.upsert({
    where: {
      username: apiUser.username,
    },

    update:  apiUser,
    create: apiUser,
  });

  void client.$disconnect();

  console.info("Seeding database with custom seed...");
  customSeed();

  console.info("Seeded database successfully");
}

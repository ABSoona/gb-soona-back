import { PrismaClient } from "@prisma/client";

export async function customSeed() {
  const client = new PrismaClient();
  const username = "admin";
  const email = "admin@soona.fr";
  const firstName = "admin";
  const lastName = "admin";
  const status = "active"
  const roles = ["admin"]
  const role = "admin"

  //replace this sample code to populate your database
  //with data that is required for your service to start
  await client.user.update({
    where: { username: username },
    data: {
      username,firstName,lastName,status,email,roles,role
    },
  });

  client.$disconnect();
}

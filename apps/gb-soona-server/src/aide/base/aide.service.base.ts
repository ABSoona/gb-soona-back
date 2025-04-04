/*
------------------------------------------------------------------------------ 
This code was generated by Amplication. 
 
Changes to this file will be lost if the code is regenerated. 

There are other ways to to customize your code, see this doc to learn more
https://docs.amplication.com/how-to/custom-code

------------------------------------------------------------------------------
  */
import { PrismaService } from "../../prisma/prisma.service";
import {
  Prisma,
  Aide as PrismaAide,
  Contact as PrismaContact,
} from "@prisma/client";

export class AideServiceBase {
  constructor(protected readonly prisma: PrismaService) {}

  async count(args: Omit<Prisma.AideCountArgs, "select">): Promise<number> {
    return this.prisma.aide.count(args);
  }

  async aides(args: Prisma.AideFindManyArgs): Promise<PrismaAide[]> {
    return this.prisma.aide.findMany(args);
  }
  async aide(args: Prisma.AideFindUniqueArgs): Promise<PrismaAide | null> {
    return this.prisma.aide.findUnique(args);
  }
  async createAide(args: Prisma.AideCreateArgs): Promise<PrismaAide> {
    return this.prisma.aide.create(args);
  }
  async updateAide(args: Prisma.AideUpdateArgs): Promise<PrismaAide> {
    return this.prisma.aide.update(args);
  }
  async deleteAide(args: Prisma.AideDeleteArgs): Promise<PrismaAide> {
    return this.prisma.aide.delete(args);
  }

  async getContact(parentId: number): Promise<PrismaContact | null> {
    return this.prisma.aide
      .findUnique({
        where: { id: parentId },
      })
      .contact();
  }
}

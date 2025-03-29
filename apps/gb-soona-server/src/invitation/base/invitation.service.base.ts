/*
------------------------------------------------------------------------------ 
This code was generated by Amplication. 
 
Changes to this file will be lost if the code is regenerated. 

There are other ways to to customize your code, see this doc to learn more
https://docs.amplication.com/how-to/custom-code

------------------------------------------------------------------------------
  */
import { PrismaService } from "../../prisma/prisma.service";
import { Prisma, Invitation as PrismaInvitation } from "@prisma/client";

export class InvitationServiceBase {
  constructor(protected readonly prisma: PrismaService) {}

  async count(
    args: Omit<Prisma.InvitationCountArgs, "select">
  ): Promise<number> {
    return this.prisma.invitation.count(args);
  }

  async invitations(
    args: Prisma.InvitationFindManyArgs
  ): Promise<PrismaInvitation[]> {
    return this.prisma.invitation.findMany(args);
  }
  async invitation(
    args: Prisma.InvitationFindUniqueArgs
  ): Promise<PrismaInvitation | null> {
    return this.prisma.invitation.findUnique(args);
  }
  async createInvitation(
    args: Prisma.InvitationCreateArgs
  ): Promise<PrismaInvitation> {
    return this.prisma.invitation.create(args);
  }
  async updateInvitation(
    args: Prisma.InvitationUpdateArgs
  ): Promise<PrismaInvitation> {
    return this.prisma.invitation.update(args);
  }
  async deleteInvitation(
    args: Prisma.InvitationDeleteArgs
  ): Promise<PrismaInvitation> {
    return this.prisma.invitation.delete(args);
  }
}

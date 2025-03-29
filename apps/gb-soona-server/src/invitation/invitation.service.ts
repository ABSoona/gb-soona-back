import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { InvitationServiceBase } from "./base/invitation.service.base";

@Injectable()
export class InvitationService extends InvitationServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}

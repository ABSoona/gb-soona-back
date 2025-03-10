import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { VisiteServiceBase } from "./base/visite.service.base";

@Injectable()
export class VisiteService extends VisiteServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}

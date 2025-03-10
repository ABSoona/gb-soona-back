import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { AideServiceBase } from "./base/aide.service.base";

@Injectable()
export class AideService extends AideServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}

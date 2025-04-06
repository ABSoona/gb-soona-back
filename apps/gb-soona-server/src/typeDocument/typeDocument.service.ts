import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { TypeDocumentServiceBase } from "./base/typeDocument.service.base";

@Injectable()
export class TypeDocumentService extends TypeDocumentServiceBase {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma);
  }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { LocalStorageService } from "src/storage/providers/local/local.storage.service";
import { DocumentServiceBase } from "./base/document.service.base";
import { Prisma, Document as PrismaDocument } from "@prisma/client";

@Injectable()
export class DocumentService extends DocumentServiceBase {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly localStorageService: LocalStorageService
  ) {
    super(prisma, localStorageService);
  }

  // Precharge typeDocument en une seule requete (evite le N+1 : une requete
  // par document pour son type). Voir demande.service.ts pour le meme pattern.
  async documents(
    args: Prisma.DocumentFindManyArgs
  ): Promise<PrismaDocument[]> {
    return super.documents({
      ...args,
      include: { typeDocument: true },
    });
  }
}

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
  Document as PrismaDocument,
  Contact as PrismaContact,
} from "@prisma/client";
import { LocalStorageService } from "src/storage/providers/local/local.storage.service";
import { InputJsonValue } from "src/types";
import { FileDownload, FileUpload } from "src/storage/base/storage.types";
import { LocalStorageFile } from "src/storage/providers/local/local.storage.types";

export class DocumentServiceBase {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly localStorageService: LocalStorageService
  ) {}

  async count(args: Omit<Prisma.DocumentCountArgs, "select">): Promise<number> {
    return this.prisma.document.count(args);
  }

  async documents(
    args: Prisma.DocumentFindManyArgs
  ): Promise<PrismaDocument[]> {
    return this.prisma.document.findMany(args);
  }
  async document(
    args: Prisma.DocumentFindUniqueArgs
  ): Promise<PrismaDocument | null> {
    return this.prisma.document.findUnique(args);
  }
  async createDocument(
    args: Prisma.DocumentCreateArgs
  ): Promise<PrismaDocument> {
    return this.prisma.document.create(args);
  }
  async updateDocument(
    args: Prisma.DocumentUpdateArgs
  ): Promise<PrismaDocument> {
    return this.prisma.document.update(args);
  }
  async deleteDocument(
    args: Prisma.DocumentDeleteArgs
  ): Promise<PrismaDocument> {
    return this.prisma.document.delete(args);
  }

  async uploadContenu<T extends Prisma.DocumentFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.DocumentFindUniqueArgs>,
    file: FileUpload
  ): Promise<PrismaDocument> {
    
    const originalName = file.filename.split(".").slice(0, -1).join(".");
    const extension = file.filename.split(".").pop();
    
    file.filename = `${originalName}-${args.where.id}.${extension}`;
    const containerPath = "/uploads";
    const contenu = await this.localStorageService.uploadFile(
      file,
      [],
      1000000,
      containerPath
    );

    return await this.prisma.document.update({
      where: args.where,

      data: {
        contenu: contenu as InputJsonValue,
      },
    });
  }

  async downloadContenu<T extends Prisma.DocumentFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.DocumentFindUniqueArgs>
  ): Promise<FileDownload> {
    const { contenu } = await this.prisma.document.findUniqueOrThrow({
      where: args.where,
    });

    return await this.localStorageService.downloadFile(
      contenu as unknown as LocalStorageFile
    );
  }

  async deleteContenu<T extends Prisma.DocumentFindUniqueArgs>(
    args: Prisma.SelectSubset<T, Prisma.DocumentFindUniqueArgs>
  ): Promise<PrismaDocument> {
    const { contenu } = await this.prisma.document.findUniqueOrThrow({
      where: args.where,
    });

    await this.localStorageService.deleteFile(
      contenu as unknown as LocalStorageFile
    );

    return await this.prisma.document.update({
      where: args.where,

      data: {
        contenu: Prisma.DbNull,
      },
    });
  }

  async getContact(parentId: number): Promise<PrismaContact | null> {
    return this.prisma.document
      .findUnique({
        where: { id: parentId },
      })
      .contact();
  }
}

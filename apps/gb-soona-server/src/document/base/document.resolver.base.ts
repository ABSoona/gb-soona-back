/*
------------------------------------------------------------------------------ 
This code was generated by Amplication. 
 
Changes to this file will be lost if the code is regenerated. 

There are other ways to to customize your code, see this doc to learn more
https://docs.amplication.com/how-to/custom-code

------------------------------------------------------------------------------
  */
import * as graphql from "@nestjs/graphql";
import { GraphQLError } from "graphql";
import { isRecordNotFoundError } from "../../prisma.util";
import { MetaQueryPayload } from "../../util/MetaQueryPayload";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { AclFilterResponseInterceptor } from "../../interceptors/aclFilterResponse.interceptor";
import { AclValidateRequestInterceptor } from "../../interceptors/aclValidateRequest.interceptor";
import { Document } from "./Document";
import { DocumentCountArgs } from "./DocumentCountArgs";
import { DocumentFindManyArgs } from "./DocumentFindManyArgs";
import { DocumentFindUniqueArgs } from "./DocumentFindUniqueArgs";
import { CreateDocumentArgs } from "./CreateDocumentArgs";
import { UpdateDocumentArgs } from "./UpdateDocumentArgs";
import { DeleteDocumentArgs } from "./DeleteDocumentArgs";
import { Contact } from "../../contact/base/Contact";
import { DocumentService } from "../document.service";
@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => Document)
export class DocumentResolverBase {
  constructor(
    protected readonly service: DocumentService,
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {}

  @graphql.Query(() => MetaQueryPayload)
  @nestAccessControl.UseRoles({
    resource: "Document",
    action: "read",
    possession: "any",
  })
  async _documentsMeta(
    @graphql.Args() args: DocumentCountArgs
  ): Promise<MetaQueryPayload> {
    const result = await this.service.count(args);
    return {
      count: result,
    };
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.Query(() => [Document])
  @nestAccessControl.UseRoles({
    resource: "Document",
    action: "read",
    possession: "any",
  })
  async documents(
    @graphql.Args() args: DocumentFindManyArgs
  ): Promise<Document[]> {
    return this.service.documents(args);
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.Query(() => Document, { nullable: true })
  @nestAccessControl.UseRoles({
    resource: "Document",
    action: "read",
    possession: "own",
  })
  async document(
    @graphql.Args() args: DocumentFindUniqueArgs
  ): Promise<Document | null> {
    const result = await this.service.document(args);
    if (result === null) {
      return null;
    }
    return result;
  }

  @common.UseInterceptors(AclValidateRequestInterceptor)
  @graphql.Mutation(() => Document)
  @nestAccessControl.UseRoles({
    resource: "Document",
    action: "create",
    possession: "any",
  })
  async createDocument(
    @graphql.Args() args: CreateDocumentArgs
  ): Promise<Document> {
    return await this.service.createDocument({
      ...args,
      data: {
        ...args.data,

        contact: args.data.contact
          ? {
              connect: args.data.contact,
            }
          : undefined,
      },
    });
  }

  @common.UseInterceptors(AclValidateRequestInterceptor)
  @graphql.Mutation(() => Document)
  @nestAccessControl.UseRoles({
    resource: "Document",
    action: "update",
    possession: "any",
  })
  async updateDocument(
    @graphql.Args() args: UpdateDocumentArgs
  ): Promise<Document | null> {
    try {
      return await this.service.updateDocument({
        ...args,
        data: {
          ...args.data,

          contact: args.data.contact
            ? {
                connect: args.data.contact,
              }
            : undefined,
        },
      });
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new GraphQLError(
          `No resource was found for ${JSON.stringify(args.where)}`
        );
      }
      throw error;
    }
  }

  @graphql.Mutation(() => Document)
  @nestAccessControl.UseRoles({
    resource: "Document",
    action: "delete",
    possession: "any",
  })
  async deleteDocument(
    @graphql.Args() args: DeleteDocumentArgs
  ): Promise<Document | null> {
    try {
      return await this.service.deleteDocument(args);
    } catch (error) {
      if (isRecordNotFoundError(error)) {
        throw new GraphQLError(
          `No resource was found for ${JSON.stringify(args.where)}`
        );
      }
      throw error;
    }
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.ResolveField(() => Contact, {
    nullable: true,
    name: "contact",
  })
  @nestAccessControl.UseRoles({
    resource: "Contact",
    action: "read",
    possession: "any",
  })
  async getContact(
    @graphql.Parent() parent: Document
  ): Promise<Contact | null> {
    const result = await this.service.getContact(parent.id);

    if (!result) {
      return null;
    }
    return result;
  }
}

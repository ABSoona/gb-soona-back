import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { GraphQLError } from "graphql";
import { isRecordNotFoundError } from "../prisma.util";
import { AclFilterResponseInterceptor } from "../interceptors/aclFilterResponse.interceptor";
import { AclValidateRequestInterceptor } from "../interceptors/aclValidateRequest.interceptor";
import { DocumentResolverBase } from "./base/document.resolver.base";
import { Document } from "./base/Document";
import { TypeDocument } from "../typeDocument/base/TypeDocument";
import { UpdateDocumentArgs } from "./base/UpdateDocumentArgs";
import { DocumentService } from "./document.service";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => Document)
export class DocumentResolver extends DocumentResolverBase {
  constructor(
    protected readonly service: DocumentService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }

  // Evite le N+1 : quand le document provient de DocumentService.documents()
  // (liste), son typeDocument est deja precharge (voir l'include cote
  // service) et on le retourne sans nouvelle requete.
  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.ResolveField(() => TypeDocument, {
    nullable: true,
    name: "typeDocument",
  })
  @nestAccessControl.UseRoles({
    resource: "TypeDocument",
    action: "read",
    possession: "any",
  })
  async getTypeDocument(@graphql.Parent() parent: Document): Promise<TypeDocument | null> {
    const preloaded = (parent as any).typeDocument;
    if (preloaded !== undefined) {
      return preloaded;
    }
    const result = await this.service.getTypeDocument(parent.id);
    if (!result) {
      return null;
    }
    return result;
  }

  // Surcharge la mutation generee : celle-ci mappe `aide: null` sur
  // `undefined` (aucun effet), ce qui empeche de detacher un document
  // d'une aide. Un `aide: null` explicite doit desormais deconnecter la
  // relation, pour permettre le retrait d'un justificatif attache a une aide.
  @common.UseInterceptors(AclValidateRequestInterceptor)
  @graphql.Mutation(() => Document)
  @nestAccessControl.UseRoles({
    resource: "Document",
    action: "update",
    possession: "any",
  })
  async updateDocument(@graphql.Args() args: UpdateDocumentArgs): Promise<Document | null> {
    try {
      return await this.service.updateDocument({
        ...args,
        data: {
          ...args.data,

          aide:
            args.data.aide === null
              ? { disconnect: true }
              : args.data.aide
              ? { connect: args.data.aide }
              : undefined,

          contact: args.data.contact
            ? { connect: args.data.contact }
            : undefined,

          demande: args.data.demande
            ? { connect: args.data.demande }
            : undefined,

          typeDocument: args.data.typeDocument
            ? { connect: args.data.typeDocument }
            : undefined,

          visites: args.data.visites
            ? { connect: args.data.visites }
            : undefined,

          versements: args.data.versements
            ? { connect: args.data.versements }
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
}

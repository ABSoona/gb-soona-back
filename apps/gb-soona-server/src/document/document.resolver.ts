import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { AclFilterResponseInterceptor } from "../interceptors/aclFilterResponse.interceptor";
import { DocumentResolverBase } from "./base/document.resolver.base";
import { Document } from "./base/Document";
import { TypeDocument } from "../typeDocument/base/TypeDocument";
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
}

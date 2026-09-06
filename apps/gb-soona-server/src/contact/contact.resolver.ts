import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { AclFilterResponseInterceptor } from "../interceptors/aclFilterResponse.interceptor";
import { ContactResolverBase } from "./base/contact.resolver.base";
import { Contact } from "./base/Contact";
import { Aide } from "../aide/base/Aide";
import { AideFindManyArgs } from "../aide/base/AideFindManyArgs";
import { Document } from "../document/base/Document";
import { DocumentFindManyArgs } from "../document/base/DocumentFindManyArgs";
import { ContactService } from "./contact.service";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => Contact)
export class ContactResolver extends ContactResolverBase {
  constructor(
    protected readonly service: ContactService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }

  // Evite le N+1 : quand le contact provient d'une demande chargee via
  // DemandeService.demandes() (voir l'include ajoute cote demande), ses
  // aides sont deja precharges et on les retourne sans nouvelle requete.
  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.ResolveField(() => [Aide], { name: "aides" })
  @nestAccessControl.UseRoles({
    resource: "Aide",
    action: "read",
    possession: "any",
  })
  async findAides(
    @graphql.Parent() parent: Contact,
    @graphql.Args() args: AideFindManyArgs
  ): Promise<Aide[]> {
    const preloaded = (parent as any).aides;
    const hasCustomFilter = !!args?.where || !!args?.skip || !!args?.take || !!args?.orderBy;
    if (Array.isArray(preloaded) && !hasCustomFilter) {
      return preloaded;
    }
    const results = await this.service.findAides(parent.id, args);
    if (!results) {
      return [];
    }
    return results;
  }

  // Evite le N+1 : quand le contact provient de ContactService.contacts()
  // (liste), ses documents sont deja precharges (voir l'include cote
  // service) et on les retourne sans nouvelle requete.
  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.ResolveField(() => [Document], { name: "documents" })
  @nestAccessControl.UseRoles({
    resource: "Document",
    action: "read",
    possession: "any",
  })
  async findDocuments(
    @graphql.Parent() parent: Contact,
    @graphql.Args() args: DocumentFindManyArgs
  ): Promise<Document[]> {
    const preloaded = (parent as any).documents;
    const hasCustomFilter = !!args?.where || !!args?.skip || !!args?.take || !!args?.orderBy;
    if (Array.isArray(preloaded) && !hasCustomFilter) {
      return preloaded;
    }
    const results = await this.service.findDocuments(parent.id, args);
    if (!results) {
      return [];
    }
    return results;
  }
}

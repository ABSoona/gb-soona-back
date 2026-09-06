import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { AclFilterResponseInterceptor } from "../interceptors/aclFilterResponse.interceptor";
import { VisiteResolverBase } from "./base/visite.resolver.base";
import { Visite } from "./base/Visite";
import { User } from "../user/base/User";
import { Demande } from "../demande/base/Demande";
import { Document } from "../document/base/Document";
import { VisiteService } from "./visite.service";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => Visite)
export class VisiteResolver extends VisiteResolverBase {
  constructor(
    protected readonly service: VisiteService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }

  // Evite le N+1 : quand la visite provient de VisiteService.visites() (liste),
  // acteur/demande/document sont deja precharges (voir l'include cote service)
  // et on les retourne sans nouvelle requete.

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.ResolveField(() => User, {
    nullable: true,
    name: "acteur",
  })
  @nestAccessControl.UseRoles({
    resource: "User",
    action: "read",
    possession: "any",
  })
  async getActeur(@graphql.Parent() parent: Visite): Promise<User | null> {
    const preloaded = (parent as any).acteur;
    if (preloaded !== undefined) {
      return preloaded;
    }
    const result = await this.service.getActeur(parent.id);
    if (!result) {
      return null;
    }
    return result;
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.ResolveField(() => Demande, {
    nullable: true,
    name: "demande",
  })
  @nestAccessControl.UseRoles({
    resource: "Demande",
    action: "read",
    possession: "any",
  })
  async getDemande(@graphql.Parent() parent: Visite): Promise<Demande | null> {
    const preloaded = (parent as any).demande;
    if (preloaded !== undefined) {
      return preloaded;
    }
    const result = await this.service.getDemande(parent.id);
    if (!result) {
      return null;
    }
    return result;
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.ResolveField(() => Document, {
    nullable: true,
    name: "document",
  })
  @nestAccessControl.UseRoles({
    resource: "Document",
    action: "read",
    possession: "any",
  })
  async getDocument(@graphql.Parent() parent: Visite): Promise<Document | null> {
    const preloaded = (parent as any).document;
    if (preloaded !== undefined) {
      return preloaded;
    }
    const result = await this.service.getDocument(parent.id);
    if (!result) {
      return null;
    }
    return result;
  }
}

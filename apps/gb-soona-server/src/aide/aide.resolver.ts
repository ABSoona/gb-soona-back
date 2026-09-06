import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { AclFilterResponseInterceptor } from "../interceptors/aclFilterResponse.interceptor";
import { AideResolverBase } from "./base/aide.resolver.base";
import { Aide } from "./base/Aide";
import { Contact } from "../contact/base/Contact";
import { Demande } from "../demande/base/Demande";
import { Versement } from "../versement/base/Versement";
import { VersementFindManyArgs } from "../versement/base/VersementFindManyArgs";
import { User } from "src/user/base/User";
import { AideService } from "./aide.service";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => Aide)
export class AideResolver extends AideResolverBase {
  constructor(
    protected readonly service: AideService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }

  // Evite le N+1 : quand l'aide provient de AideService.aides() (liste),
  // contact/demande/versements/acteurVersement sont deja precharges (voir
  // l'include cote service) et on les retourne sans nouvelle requete.

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.ResolveField(() => [Versement], { name: "versements" })
  @nestAccessControl.UseRoles({
    resource: "Versement",
    action: "read",
    possession: "any",
  })
  async findVersements(
    @graphql.Parent() parent: Aide,
    @graphql.Args() args: VersementFindManyArgs
  ): Promise<Versement[]> {
    const preloaded = (parent as any).versements;
    const hasCustomFilter = !!args?.where || !!args?.skip || !!args?.take || !!args?.orderBy;
    if (Array.isArray(preloaded) && !hasCustomFilter) {
      return preloaded;
    }
    const results = await this.service.findVersements(parent.id, args);
    if (!results) {
      return [];
    }
    return results;
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
  async getContact(@graphql.Parent() parent: Aide): Promise<Contact | null> {
    const preloaded = (parent as any).contact;
    if (preloaded !== undefined) {
      return preloaded;
    }
    const result = await this.service.getContact(parent.id);
    if (!result) {
      return null;
    }
    return result;
  }

  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.ResolveField(() => User, {
    nullable: true,
    name: "acteurVersement",
  })
  @nestAccessControl.UseRoles({
    resource: "User",
    action: "read",
    possession: "any",
  })
  async getActeurVersement(@graphql.Parent() parent: Aide): Promise<User | null> {
    const preloaded = (parent as any).acteurVersement;
    if (preloaded !== undefined) {
      return preloaded;
    }
    const result = await this.service.getActeurVersement(parent.id);
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
  async getDemande(@graphql.Parent() parent: Aide): Promise<Demande | null> {
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
}

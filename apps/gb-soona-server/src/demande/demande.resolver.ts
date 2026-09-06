import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { AclFilterResponseInterceptor } from "../interceptors/aclFilterResponse.interceptor";
import { DemandeResolverBase } from "./base/demande.resolver.base";
import { Demande } from "./base/Demande";
import { Contact } from "../contact/base/Contact";
import { User } from "../user/base/User";
import { DemandeActivity } from "../demandeActivity/base/DemandeActivity";
import { DemandeActivityFindManyArgs } from "../demandeActivity/base/DemandeActivityFindManyArgs";
import { DemandeService } from "./demande.service";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => Demande)
export class DemandeResolver extends DemandeResolverBase {
  constructor(
    protected readonly service: DemandeService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }

  // Les 3 overrides ci-dessous evitent le probleme N+1 : quand la demande a
  // ete chargee via DemandeService.demandes() (liste), le contact, l'acteur
  // et les demandeActivities sont deja precharges (voir l'include ajoute
  // dans demande.service.ts) et on les retourne directement au lieu de
  // relancer une requete Prisma par ligne.

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
  async getContact(@graphql.Parent() parent: Demande): Promise<Contact | null> {
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
    name: "acteur",
  })
  @nestAccessControl.UseRoles({
    resource: "User",
    action: "read",
    possession: "any",
  })
  async getActeur(@graphql.Parent() parent: Demande): Promise<User | null> {
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
  @graphql.ResolveField(() => [DemandeActivity], {
    name: "demandeActivities",
  })
  @nestAccessControl.UseRoles({
    resource: "DemandeActivity",
    action: "read",
    possession: "any",
  })
  async findDemandeActivities(
    @graphql.Parent() parent: Demande,
    @graphql.Args() args: DemandeActivityFindManyArgs
  ): Promise<DemandeActivity[]> {
    // Le contenu preloaded est trie par createdAt desc (voir l'include dans
    // demande.service.ts) : on ne le reutilise que si l'appel ne demande
    // rien d'autre que ce meme tri, sans filtre/pagination particuliers.
    const preloaded = (parent as any).demandeActivities;
    const hasCustomFilter = !!args?.where || !!args?.skip || !!args?.take;
    const orderByMatchesDefault =
      !args?.orderBy ||
      (Array.isArray(args.orderBy) &&
        args.orderBy.length === 1 &&
        Object.keys(args.orderBy[0] ?? {}).length === 1 &&
        args.orderBy[0]?.createdAt === "desc");
    if (Array.isArray(preloaded) && !hasCustomFilter && orderByMatchesDefault) {
      return preloaded;
    }
    const results = await this.service.findDemandeActivities(parent.id, args);
    if (!results) {
      return [];
    }
    return results;
  }
}

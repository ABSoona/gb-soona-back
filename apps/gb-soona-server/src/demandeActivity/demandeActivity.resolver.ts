import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { AclFilterResponseInterceptor } from "../interceptors/aclFilterResponse.interceptor";
import { DemandeActivityResolverBase } from "./base/demandeActivity.resolver.base";
import { DemandeActivity } from "./base/DemandeActivity";
import { User } from "../user/base/User";
import { DemandeActivityService } from "./demandeActivity.service";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => DemandeActivity)
export class DemandeActivityResolver extends DemandeActivityResolverBase {
  constructor(
    protected readonly service: DemandeActivityService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }

  // Evite le N+1 : quand l'activite provient d'une demande chargee via
  // DemandeService.demandes() (voir l'include cote demande), son user est
  // deja precharge et on le retourne sans nouvelle requete.
  @common.UseInterceptors(AclFilterResponseInterceptor)
  @graphql.ResolveField(() => User, {
    nullable: true,
    name: "user",
  })
  @nestAccessControl.UseRoles({
    resource: "User",
    action: "read",
    possession: "any",
  })
  async getUser(@graphql.Parent() parent: DemandeActivity): Promise<User | null> {
    const preloaded = (parent as any).user;
    if (preloaded !== undefined) {
      return preloaded;
    }
    const result = await this.service.getUser(parent.id);
    if (!result) {
      return null;
    }
    return result;
  }
}

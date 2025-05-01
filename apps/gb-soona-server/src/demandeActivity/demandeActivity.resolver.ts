import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { DemandeActivityResolverBase } from "./base/demandeActivity.resolver.base";
import { DemandeActivity } from "./base/DemandeActivity";
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
}

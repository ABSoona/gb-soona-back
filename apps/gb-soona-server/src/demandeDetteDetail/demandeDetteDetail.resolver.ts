import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { DemandeDetteDetailResolverBase } from "./base/demandeDetteDetail.resolver.base";
import { DemandeDetteDetail } from "./base/DemandeDetteDetail";
import { DemandeDetteDetailService } from "./demandeDetteDetail.service";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => DemandeDetteDetail)
export class DemandeDetteDetailResolver extends DemandeDetteDetailResolverBase {
  constructor(
    protected readonly service: DemandeDetteDetailService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}

import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { DemandeAutreChargeResolverBase } from "./base/demandeAutreCharge.resolver.base";
import { DemandeAutreCharge } from "./base/DemandeAutreCharge";
import { DemandeAutreChargeService } from "./demandeAutreCharge.service";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => DemandeAutreCharge)
export class DemandeAutreChargeResolver extends DemandeAutreChargeResolverBase {
  constructor(
    protected readonly service: DemandeAutreChargeService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}

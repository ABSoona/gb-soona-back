import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { DemandeSituationHistoryResolverBase } from "./base/demandeSituationHistory.resolver.base";
import { DemandeSituationHistory } from "./base/DemandeSituationHistory";
import { DemandeSituationHistoryService } from "./demandeSituationHistory.service";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => DemandeSituationHistory)
export class DemandeSituationHistoryResolver extends DemandeSituationHistoryResolverBase {
  constructor(
    protected readonly service: DemandeSituationHistoryService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}

import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { DemandeStatusHistoryResolverBase } from "./base/demandeStatusHistory.resolver.base";
import { DemandeStatusHistory } from "./base/DemandeStatusHistory";
import { DemandeStatusHistoryService } from "./demandeStatusHistory.service";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => DemandeStatusHistory)
export class DemandeStatusHistoryResolver extends DemandeStatusHistoryResolverBase {
  constructor(
    protected readonly service: DemandeStatusHistoryService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}

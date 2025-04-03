import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { WebsiteDemandeResolverBase } from "./base/websiteDemande.resolver.base";
import { WebsiteDemande } from "./base/WebsiteDemande";
import { WebsiteDemandeService } from "./websiteDemande.service";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => WebsiteDemande)
export class WebsiteDemandeResolver extends WebsiteDemandeResolverBase {
  constructor(
    protected readonly service: WebsiteDemandeService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}

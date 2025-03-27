import * as graphql from "@nestjs/graphql";
import * as nestAccessControl from "nest-access-control";
import * as gqlACGuard from "../auth/gqlAC.guard";
import { GqlDefaultAuthGuard } from "../auth/gqlDefaultAuth.guard";
import * as common from "@nestjs/common";
import { UserNotificationPreferenceResolverBase } from "./base/userNotificationPreference.resolver.base";
import { UserNotificationPreference } from "./base/UserNotificationPreference";
import { UserNotificationPreferenceService } from "./userNotificationPreference.service";

@common.UseGuards(GqlDefaultAuthGuard, gqlACGuard.GqlACGuard)
@graphql.Resolver(() => UserNotificationPreference)
export class UserNotificationPreferenceResolver extends UserNotificationPreferenceResolverBase {
  constructor(
    protected readonly service: UserNotificationPreferenceService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}

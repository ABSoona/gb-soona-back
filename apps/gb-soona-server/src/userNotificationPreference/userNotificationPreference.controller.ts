import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { UserNotificationPreferenceService } from "./userNotificationPreference.service";
import { UserNotificationPreferenceControllerBase } from "./base/userNotificationPreference.controller.base";

@swagger.ApiTags("userNotificationPreferences")
@common.Controller("userNotificationPreferences")
export class UserNotificationPreferenceController extends UserNotificationPreferenceControllerBase {
  constructor(
    protected readonly service: UserNotificationPreferenceService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}

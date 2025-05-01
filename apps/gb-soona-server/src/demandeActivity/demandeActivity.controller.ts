import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { DemandeActivityService } from "./demandeActivity.service";
import { DemandeActivityControllerBase } from "./base/demandeActivity.controller.base";

@swagger.ApiTags("demandeActivities")
@common.Controller("demandeActivities")
export class DemandeActivityController extends DemandeActivityControllerBase {
  constructor(
    protected readonly service: DemandeActivityService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}

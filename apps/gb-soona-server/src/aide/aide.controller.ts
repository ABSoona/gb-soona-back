import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { AideService } from "./aide.service";
import { AideControllerBase } from "./base/aide.controller.base";

@swagger.ApiTags("aides")
@common.Controller("aides")
export class AideController extends AideControllerBase {
  constructor(
    protected readonly service: AideService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}

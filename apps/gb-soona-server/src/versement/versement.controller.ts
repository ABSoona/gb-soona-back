import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { VersementService } from "./versement.service";
import { VersementControllerBase } from "./base/versement.controller.base";

@swagger.ApiTags("versements")
@common.Controller("versements")
export class VersementController extends VersementControllerBase {
  constructor(
    protected readonly service: VersementService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}

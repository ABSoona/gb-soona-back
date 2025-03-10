import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { VisiteService } from "./visite.service";
import { VisiteControllerBase } from "./base/visite.controller.base";

@swagger.ApiTags("visites")
@common.Controller("visites")
export class VisiteController extends VisiteControllerBase {
  constructor(
    protected readonly service: VisiteService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}

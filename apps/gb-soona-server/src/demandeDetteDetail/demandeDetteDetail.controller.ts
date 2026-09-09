import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { DemandeDetteDetailService } from "./demandeDetteDetail.service";
import { DemandeDetteDetailControllerBase } from "./base/demandeDetteDetail.controller.base";

@swagger.ApiTags("demandeDetteDetails")
@common.Controller("demandeDetteDetails")
export class DemandeDetteDetailController extends DemandeDetteDetailControllerBase {
  constructor(
    protected readonly service: DemandeDetteDetailService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}

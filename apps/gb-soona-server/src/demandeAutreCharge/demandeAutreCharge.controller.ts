import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { DemandeAutreChargeService } from "./demandeAutreCharge.service";
import { DemandeAutreChargeControllerBase } from "./base/demandeAutreCharge.controller.base";

@swagger.ApiTags("demandeAutreCharges")
@common.Controller("demandeAutreCharges")
export class DemandeAutreChargeController extends DemandeAutreChargeControllerBase {
  constructor(
    protected readonly service: DemandeAutreChargeService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}

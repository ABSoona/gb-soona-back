import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { DemandeService } from "./demande.service";
import { DemandeControllerBase } from "./base/demande.controller.base";

@swagger.ApiTags("demandes")
@common.Controller("demandes")
export class DemandeController extends DemandeControllerBase {
  constructor(
    protected readonly service: DemandeService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}

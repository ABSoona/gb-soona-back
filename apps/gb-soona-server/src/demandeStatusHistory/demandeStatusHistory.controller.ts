import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { DemandeStatusHistoryService } from "./demandeStatusHistory.service";
import { DemandeStatusHistoryControllerBase } from "./base/demandeStatusHistory.controller.base";

@swagger.ApiTags("demandeStatusHistories")
@common.Controller("demandeStatusHistories")
export class DemandeStatusHistoryController extends DemandeStatusHistoryControllerBase {
  constructor(
    protected readonly service: DemandeStatusHistoryService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}

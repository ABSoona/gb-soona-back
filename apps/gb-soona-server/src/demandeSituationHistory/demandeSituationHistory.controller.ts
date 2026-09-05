import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { DemandeSituationHistoryService } from "./demandeSituationHistory.service";
import { DemandeSituationHistoryControllerBase } from "./base/demandeSituationHistory.controller.base";

@swagger.ApiTags("demandeSituationHistories")
@common.Controller("demandeSituationHistories")
export class DemandeSituationHistoryController extends DemandeSituationHistoryControllerBase {
  constructor(
    protected readonly service: DemandeSituationHistoryService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}

import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import { DemandeService } from "./demande.service";
import { DemandeControllerBase } from "./base/demande.controller.base";

@swagger.ApiTags("demandes")
@common.Controller("demandes")
export class DemandeController extends DemandeControllerBase {
  constructor(protected readonly service: DemandeService) {
    super(service);
  }
}

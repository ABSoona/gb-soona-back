import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { WebsiteDemandeService } from "./websiteDemande.service";
import { WebsiteDemandeControllerBase } from "./base/websiteDemande.controller.base";

@swagger.ApiTags("websiteDemandes")
@common.Controller("websiteDemandes")
export class WebsiteDemandeController extends WebsiteDemandeControllerBase {
  constructor(
    protected readonly service: WebsiteDemandeService,
    @nestAccessControl.InjectRolesBuilder()
    protected readonly rolesBuilder: nestAccessControl.RolesBuilder
  ) {
    super(service, rolesBuilder);
  }
}

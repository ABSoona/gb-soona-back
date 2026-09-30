import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import { Post, Res } from "@nestjs/common";
import { Response } from "express";
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

  @Post("export-cac")
  async exportCac(
    @common.Body() body: { versementIds: number[] },
    @Res() res: Response
  ) {
    return this.service.exportCac(body.versementIds ?? [], res);
  }
}

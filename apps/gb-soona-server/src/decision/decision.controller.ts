import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import * as defaultAuthGuard from "../auth/defaultAuth.guard";
import { Response } from "express";
import { DecisionService } from "./decision.service";

@swagger.ApiTags("decisions")
@common.Controller("decisions")
@common.UseGuards(defaultAuthGuard.DefaultAuthGuard, nestAccessControl.ACGuard)
export class DecisionController {
  constructor(private readonly service: DecisionService) {}

  @common.Get(":id/pdf")
  async getPdf(@common.Param("id") id: string, @common.Res() res: Response) {
    return this.service.generateDecisionPdf(Number(id), res);
  }
}

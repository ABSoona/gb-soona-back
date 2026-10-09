import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import * as defaultAuthGuard from "../auth/defaultAuth.guard";
import { EmailTemplateService } from "./emailTemplate.service";

@swagger.ApiTags("email-templates")
@common.Controller("email-templates")
@common.UseGuards(defaultAuthGuard.DefaultAuthGuard, nestAccessControl.ACGuard)
export class EmailTemplateController {
  constructor(private readonly service: EmailTemplateService) {}

  @common.Get(":code")
  async getByCode(@common.Param("code") code: string) {
    return this.service.getByCode(code);
  }

  @common.Put(":code")
  async upsert(
    @common.Param("code") code: string,
    @common.Body() data: { objet: string; corps: string }
  ) {
    return this.service.upsert(code, data.objet, data.corps);
  }
}

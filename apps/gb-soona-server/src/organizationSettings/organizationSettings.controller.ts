import * as common from "@nestjs/common";
import * as swagger from "@nestjs/swagger";
import * as nestAccessControl from "nest-access-control";
import * as defaultAuthGuard from "../auth/defaultAuth.guard";
import { OrganizationSettingsService } from "./organizationSettings.service";

@swagger.ApiTags("organization-settings")
@common.Controller("organization-settings")
@common.UseGuards(defaultAuthGuard.DefaultAuthGuard, nestAccessControl.ACGuard)
export class OrganizationSettingsController {
  constructor(private readonly service: OrganizationSettingsService) {}

  @common.Get()
  async get() {
    return this.service.get();
  }

  @common.Put()
  async update(
    @common.Body() data: { nom?: string; adresse?: string; rna?: string; email?: string; telephone?: string }
  ) {
    return this.service.update(data);
  }
}

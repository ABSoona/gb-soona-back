import { Module } from "@nestjs/common";
import { OrganizationSettingsController } from "./organizationSettings.controller";
import { OrganizationSettingsService } from "./organizationSettings.service";

@Module({
  controllers: [OrganizationSettingsController],
  providers: [OrganizationSettingsService],
  exports: [OrganizationSettingsService],
})
export class OrganizationSettingsModule {}

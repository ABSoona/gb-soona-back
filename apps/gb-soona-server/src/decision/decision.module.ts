import { Module } from "@nestjs/common";
import { DemandeModule } from "../demande/demande.module";
import { OrganizationSettingsModule } from "../organizationSettings/organizationSettings.module";
import { DecisionService } from "./decision.service";
import { DecisionResolver } from "./decision.resolver";
import { DecisionController } from "./decision.controller";

@Module({
  imports: [DemandeModule, OrganizationSettingsModule],
  controllers: [DecisionController],
  providers: [DecisionService, DecisionResolver],
  exports: [DecisionService],
})
export class DecisionModule {}

import { Module } from "@nestjs/common";
import { WebsiteDemandeModuleBase } from "./base/websiteDemande.module.base";
import { WebsiteDemandeService } from "./websiteDemande.service";
import { WebsiteDemandeController } from "./websiteDemande.controller";
import { WebsiteDemandeResolver } from "./websiteDemande.resolver";

@Module({
  imports: [WebsiteDemandeModuleBase],
  controllers: [WebsiteDemandeController],
  providers: [WebsiteDemandeService, WebsiteDemandeResolver],
  exports: [WebsiteDemandeService],
})
export class WebsiteDemandeModule {}

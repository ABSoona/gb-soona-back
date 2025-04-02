import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { WebsiteDemandeModuleBase } from "./base/websiteDemande.module.base";
import { WebsiteDemandeService } from "./websiteDemande.service";
import { WebsiteDemandeController } from "./websiteDemande.controller";
import { WebsiteDemandeResolver } from "./websiteDemande.resolver";

@Module({
  imports: [WebsiteDemandeModuleBase, forwardRef(() => AuthModule)],
  controllers: [WebsiteDemandeController],
  providers: [WebsiteDemandeService, WebsiteDemandeResolver],
  exports: [WebsiteDemandeService],
})
export class WebsiteDemandeModule {}

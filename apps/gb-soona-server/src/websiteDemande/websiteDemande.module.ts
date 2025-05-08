import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { WebsiteDemandeModuleBase } from "./base/websiteDemande.module.base";
import { WebsiteDemandeService } from "./websiteDemande.service";
import { WebsiteDemandeController } from "./websiteDemande.controller";
import { WebsiteDemandeResolver } from "./websiteDemande.resolver";
import { QueueDispatcherModule } from "src/bullmq/queue-dispatcher.module";
import { WebSiteDemandeProcessor } from "./websiteDemande.processor";
import { DemandeModule } from "src/demande/demande.module";
import { MailModule } from "src/mail/mail.module";
import { WebsiteDemandeNotificationService } from "src/websiteDemande/website-demande-notification.service";

@Module({
  imports: [WebsiteDemandeModuleBase, forwardRef(() => AuthModule),QueueDispatcherModule,MailModule,DemandeModule],
  controllers: [WebsiteDemandeController],
  providers: [WebsiteDemandeService, WebsiteDemandeResolver,WebSiteDemandeProcessor,WebsiteDemandeNotificationService],
  exports: [WebsiteDemandeService,WebsiteDemandeNotificationService],
})
export class WebsiteDemandeModule {}

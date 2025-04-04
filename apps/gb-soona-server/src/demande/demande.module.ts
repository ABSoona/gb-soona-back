import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DemandeModuleBase } from "./base/demande.module.base";
import { DemandeService } from "./demande.service";
import { DemandeController } from "./demande.controller";
import { DemandeResolver } from "./demande.resolver";
import { MailService } from "src/mail/mail.service";
import { MailModule } from "src/mail/mail.module";


@Module({
  imports: [DemandeModuleBase, forwardRef(() => AuthModule),MailModule],
  controllers: [DemandeController],
  providers: [DemandeService, DemandeResolver],
  exports: [DemandeService],
})
export class DemandeModule {}

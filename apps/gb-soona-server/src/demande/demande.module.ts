import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DemandeModuleBase } from "./base/demande.module.base";
import { DemandeService } from "./demande.service";
import { DemandeController } from "./demande.controller";
import { DemandeResolver } from "./demande.resolver";
import { MailService } from "src/mail/mail.service";
import { MailModule } from "src/mail/mail.module";
import { DemandeNotificationService } from "./demande-notification.service";
import { TokenService } from "src/auth/token.service";
import { JwtService } from "@nestjs/jwt";
import { SecretsManagerService } from "src/providers/secrets/secretsManager.service";


@Module({
  imports: [
    DemandeModuleBase,
    forwardRef(() => AuthModule), // ✅ injecte bien AuthModule
    MailModule
  ],
  controllers: [DemandeController],
  providers: [
    DemandeService,
    DemandeResolver,
    DemandeNotificationService,
    // ❌ Supprime TokenService, JwtService, SecretsManagerService ici
  ],
  exports: [DemandeService, DemandeNotificationService],
})
export class DemandeModule {}

import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DemandeModuleBase } from "./base/demande.module.base";
import { DemandeService } from "./demande.service";
import { DemandeController } from "./demande.controller";
import { DemandeResolver } from "./demande.resolver";

@Module({
  imports: [DemandeModuleBase, forwardRef(() => AuthModule)],
  controllers: [DemandeController],
  providers: [DemandeService, DemandeResolver],
  exports: [DemandeService],
})
export class DemandeModule {}

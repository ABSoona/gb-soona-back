import { Module } from "@nestjs/common";
import { DemandeModuleBase } from "./base/demande.module.base";
import { DemandeService } from "./demande.service";
import { DemandeController } from "./demande.controller";
import { DemandeResolver } from "./demande.resolver";

@Module({
  imports: [DemandeModuleBase],
  controllers: [DemandeController],
  providers: [DemandeService, DemandeResolver],
  exports: [DemandeService],
})
export class DemandeModule {}

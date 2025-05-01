import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DemandeStatusHistoryModuleBase } from "./base/demandeStatusHistory.module.base";
import { DemandeStatusHistoryService } from "./demandeStatusHistory.service";
import { DemandeStatusHistoryController } from "./demandeStatusHistory.controller";
import { DemandeStatusHistoryResolver } from "./demandeStatusHistory.resolver";

@Module({
  imports: [DemandeStatusHistoryModuleBase, forwardRef(() => AuthModule)],
  controllers: [DemandeStatusHistoryController],
  providers: [DemandeStatusHistoryService, DemandeStatusHistoryResolver],
  exports: [DemandeStatusHistoryService],
})
export class DemandeStatusHistoryModule {}

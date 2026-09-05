import { Module, forwardRef } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { DemandeSituationHistoryModuleBase } from "./base/demandeSituationHistory.module.base";
import { DemandeSituationHistoryService } from "./demandeSituationHistory.service";
import { DemandeSituationHistoryController } from "./demandeSituationHistory.controller";
import { DemandeSituationHistoryResolver } from "./demandeSituationHistory.resolver";

@Module({
  imports: [DemandeSituationHistoryModuleBase, forwardRef(() => AuthModule)],
  controllers: [DemandeSituationHistoryController],
  providers: [DemandeSituationHistoryService, DemandeSituationHistoryResolver],
  exports: [DemandeSituationHistoryService],
})
export class DemandeSituationHistoryModule {}

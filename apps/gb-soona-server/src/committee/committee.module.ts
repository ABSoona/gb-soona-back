import { Module } from "@nestjs/common";


import { DemandeModule } from "src/demande/demande.module";
import { CommitteeService } from "./commitee.service";


@Module({
  imports: [DemandeModule],
  providers: [CommitteeService],
  exports: [CommitteeService], // ⬅️ INDISPENSABLE
})
export class CommitteeModule {}

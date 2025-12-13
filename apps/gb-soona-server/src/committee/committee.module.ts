import { Module } from "@nestjs/common";
import { CommitteeController } from "./committee.controller";
import { TelegramModule } from "../telegram/telegram.module";

@Module({
  imports: [TelegramModule],
  controllers: [CommitteeController],
})
export class CommitteeModule {}

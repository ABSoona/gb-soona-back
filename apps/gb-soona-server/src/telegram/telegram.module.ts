import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TelegramService } from "./telegram.service";
import { TelegramBot } from "./telegram.bot";
import { TelegramController } from "./telegram.controller";
import { CommitteeModule } from "../committee/committee.module";

@Module({
  imports: [
    ConfigModule,
    CommitteeModule, // ⬅️ OBLIGATOIRE
  ],
  controllers: [TelegramController],
  providers: [TelegramService, TelegramBot],
})
export class TelegramModule {}
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TelegramService } from "./telegram.service";
import { TelegramBot } from "./telegram.bot";

@Module({
  imports: [ConfigModule],
  providers: [TelegramService, TelegramBot],
  exports: [TelegramService],
})
export class TelegramModule {}

import { Injectable } from "@nestjs/common";
import { TelegramBot } from "./telegram.bot";
import type { PublishCommitteePayload } from "./telegram.types";

@Injectable()
export class TelegramService {
  constructor(private readonly telegramBot: TelegramBot) {}

  async publishToCommittee(payload: PublishCommitteePayload) {
    // Ici tu peux ajouter tes validations / formatage
    return this.telegramBot.publishCommittee(payload);
  }
}
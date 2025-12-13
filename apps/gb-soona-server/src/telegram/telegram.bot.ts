import { Bot } from "grammy";
import { ConfigService } from "@nestjs/config";
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { parseVoteData, buildMessage, buildCommitteeKeyboard } from "./telegram.utils";
import { getResults, setVote } from "./vote.store";
import type { PublishCommitteePayload } from "./telegram.types";

@Injectable()
export class TelegramBot implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramBot.name);
  private bot!: Bot;
  private committeeChatId!: number;
  private autoLeaveUnauthorized = true;

  // cache minimal pour reconstruire le message (sans DB)
  private publishedPayloads = new Map<number, PublishCommitteePayload>(); // demandeId -> payload

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const token = this.config.get<string>("TELEGRAM_BOT_TOKEN");
    if (!token) {
      this.logger.warn("TELEGRAM_BOT_TOKEN manquant : bot Telegram non démarré.");
      return;
    }

    this.committeeChatId = Number(this.config.get<string>("TELEGRAM_COMMITTEE_CHAT_ID"));
    if (!Number.isFinite(this.committeeChatId)) {
      this.logger.warn("TELEGRAM_COMMITTEE_CHAT_ID invalide : bot Telegram non démarré.");
      return;
    }

    this.autoLeaveUnauthorized = this.config.get<string>("TELEGRAM_AUTO_LEAVE_UNAUTHORIZED") !== "false";

    this.bot = new Bot(token);

    // ✅ Optionnel : quitter automatiquement les groupes non autorisés
    this.bot.on("my_chat_member", async (ctx) => {
      const chatId = ctx.chat?.id;
      if (!chatId || chatId === this.committeeChatId) return;
      if (!this.autoLeaveUnauthorized) return;

      try {
        await ctx.api.leaveChat(chatId);
        this.logger.warn(`Bot ajouté à un groupe non autorisé (${chatId}) -> quitté automatiquement.`);
      } catch (e) {
        this.logger.warn(`Impossible de quitter le groupe non autorisé (${chatId}).`);
      }
    });

    // ✅ Votes
    this.bot.on("callback_query:data", async (ctx) => {
      const chatId = ctx.chat?.id;

      // 🔒 Bloque tout ce qui n'est pas ton groupe
      if (chatId !== this.committeeChatId) {
        await ctx.answerCallbackQuery({ text: "⛔ Groupe non autorisé", show_alert: true });
        return;
      }

      const parsed = parseVoteData(ctx.callbackQuery.data);
      if (!parsed) return;

      const { demandeId, vote } = parsed;

      // enregistre vote (RAM)
      setVote(demandeId, ctx.from.id, vote);

      // reconstruit message (on réutilise le payload publié)
      const payload = this.publishedPayloads.get(demandeId);
      if (!payload) {
        await ctx.answerCallbackQuery({ text: "⚠️ Demande inconnue côté bot", show_alert: true });
        return;
      }

      const results = getResults(demandeId);
      const text = buildMessage(payload, results, false);
      const keyboard = buildCommitteeKeyboard(demandeId);

      try {
        await ctx.editMessageText(text, { reply_markup: keyboard });
      } catch {
        // parfois Telegram refuse l'edit si le texte est identique
      }

      await ctx.answerCallbackQuery({ text: "Vote enregistré ✅" });
    });

    this.bot.start(); // ✅ long polling
    this.logger.log("Bot Telegram démarré (long polling).");
  }

  onModuleDestroy() {
    try {
      this.bot?.stop();
      this.logger.log("Bot Telegram stoppé.");
    } catch {}
  }

  // appelé par le service pour publier
  async publishCommittee(payload: PublishCommitteePayload) {
    if (!this.bot) throw new Error("Bot Telegram non initialisé");

    this.publishedPayloads.set(payload.demandeId, payload);

    const results = getResults(payload.demandeId);
    const text = buildMessage(payload, results, false);
    const keyboard = buildCommitteeKeyboard(payload.demandeId);

    return this.bot.api.sendMessage(this.committeeChatId, text, { reply_markup: keyboard });
  }

  // optionnel : clôturer (supprime les boutons)
  async closeCommittee(demandeId: number) {
    const payload = this.publishedPayloads.get(demandeId);
    if (!payload) throw new Error("Demande inconnue côté bot");

    const results = getResults(demandeId);
    const finalText = buildMessage(payload, results, true);

    // Ici il faut le messageId pour éditer précisément.
    // => si tu veux la clôture, on stockera aussi messageId au moment du publish.
    return { finalText, results };
  }
}

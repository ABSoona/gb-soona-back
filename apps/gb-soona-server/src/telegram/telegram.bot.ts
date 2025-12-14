import { Bot } from "grammy";
import { ConfigService } from "@nestjs/config";
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import {
  parseVoteData,
  buildCommitteeKeyboard,
  buildCommitteeMessage,
} from "./telegram.utils";
import { clearVotes, getResults, setVote } from "./vote.store";
import type { PublishCommitteePayload } from "./telegram.types";
import { CommitteeService } from "src/committee/commitee.service";

@Injectable()
export class TelegramBot implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TelegramBot.name);

  private bot!: Bot;
  private committeeChatId!: number;
  private autoLeaveUnauthorized = true;

  // Mémoire runtime
  private publishedPayloads = new Map<number, PublishCommitteePayload>();
  private publishedMessages = new Map<number, { chatId: number; messageId: number }>();
  private closedDemandes = new Set<number>();

  constructor(private readonly config: ConfigService,
  private readonly committeeService: CommitteeService

  ) {}

  // =========================
  // LIFECYCLE
  // =========================
  onModuleInit() {
    if (!this.initBot()) return;

    this.initSecurity();
    this.initVoteHandlers();
    this.initCloseCommand();

    this.bot.start();
    this.logger.log("Bot Telegram démarré (long polling).");
  }

  onModuleDestroy() {
    try {
      this.bot?.stop();
      this.logger.log("Bot Telegram stoppé.");
    } catch {}
  }

  // =========================
  // INITIALISATION
  // =========================
  private initBot(): boolean {
    const token = this.config.get<string>("TELEGRAM_BOT_TOKEN");
    if (!token) {
      this.logger.warn("TELEGRAM_BOT_TOKEN manquant : bot Telegram non démarré.");
      return false;
    }

    this.committeeChatId = Number(this.config.get<string>("TELEGRAM_COMMITTEE_CHAT_ID"));
    if (!Number.isFinite(this.committeeChatId)) {
      this.logger.warn("TELEGRAM_COMMITTEE_CHAT_ID invalide : bot Telegram non démarré.");
      return false;
    }

    this.autoLeaveUnauthorized =
      this.config.get<string>("TELEGRAM_AUTO_LEAVE_UNAUTHORIZED") !== "false";

    this.bot = new Bot(token);
    return true;
  }

  // =========================
  // SÉCURITÉ / GROUPE
  // =========================
  private initSecurity() {
    this.bot.on("my_chat_member", async (ctx) => {
      const chatId = ctx.chat?.id;
      if (!chatId || chatId === this.committeeChatId) return;
      if (!this.autoLeaveUnauthorized) return;

      try {
        await ctx.api.leaveChat(chatId);
        this.logger.warn(
          `Bot ajouté à un groupe non autorisé (${chatId}) → quitté automatiquement.`
        );
      } catch {
        this.logger.warn(`Impossible de quitter le groupe non autorisé (${chatId}).`);
      }
    });
  }

  // =========================
  // GESTION DES VOTES
  // =========================
  private initVoteHandlers() {
    this.bot.on("callback_query:data", async (ctx) => {
      if (ctx.chat?.id !== this.committeeChatId) {
        await ctx.answerCallbackQuery({
          text: "⛔ Groupe non autorisé",
          show_alert: true,
        });
        return;
      }

      const parsed = parseVoteData(ctx.callbackQuery.data);
      if (!parsed) return;

      const { demandeId, vote } = parsed;

      if (this.closedDemandes.has(demandeId)) {
        await ctx.answerCallbackQuery({
          text: "⛔ Vote déjà clôturé",
          show_alert: true,
        });
        return;
      }

      setVote(demandeId, ctx.from.id, vote);

      const payload = this.publishedPayloads.get(demandeId);
      if (!payload) {
        await ctx.answerCallbackQuery({
          text: "⚠️ Demande inconnue",
          show_alert: true,
        });
        return;
      }

      this.refreshMessage(demandeId, payload, false);
      await ctx.answerCallbackQuery({ text: "Vote enregistré" });
    });
  }

  // =========================
  // CLÔTURE MANUELLE
  // =========================
  private initCloseCommand() {
    this.bot.command("cloturer", async (ctx) => {
      if (ctx.chat?.id !== this.committeeChatId) return;

      const parts = ctx.message?.text?.trim().split(/\s+/) ?? [];
      const demandeId = Number(parts[1]);

      if (!Number.isFinite(demandeId)) {
        await ctx.reply("Usage : /cloturer <demandeId>");
        return;
      }

      if (this.closedDemandes.has(demandeId)) {
        await ctx.reply("Ce vote est déjà clôturé.");
        return;
      }

      const payload = this.publishedPayloads.get(demandeId);
      const ref = this.publishedMessages.get(demandeId);

      if (!payload || !ref) {
        await ctx.reply("Demande inconnue ou non publiée.");
        return;
      }

      const results = getResults(demandeId);

    // 🔴 ICI : mise à jour MÉTIER (DB)
    await this.committeeService.closeDemande(demandeId, results);
    // marque clôturée côté bot
    this.closedDemandes.add(demandeId);
    clearVotes(demandeId);
    // met à jour Telegram
    await this.refreshMessage(demandeId, payload, true, ref);
    await ctx.reply(`Vote clôturé pour la demande #${demandeId}.`);
        });
  }

  // =========================
  // HELPERS
  // =========================
  private async refreshMessage(
    demandeId: number,
    payload: PublishCommitteePayload,
    closed: boolean,
    ref?: { chatId: number; messageId: number }
  ) {
    const results = getResults(demandeId);
    const text = buildCommitteeMessage(payload, results, closed);
    const keyboard = closed ? undefined : buildCommitteeKeyboard(demandeId);

    const messageRef = ref ?? this.publishedMessages.get(demandeId);
    if (!messageRef) return;

    try {
      await this.bot.api.editMessageText(
        messageRef.chatId,
        messageRef.messageId,
        text,
        { reply_markup: keyboard }
      );
    } catch {
      // édition parfois refusée si texte identique
    }
  }

  // =========================
  // PUBLICATION
  // =========================
  async publishCommittee(payload: PublishCommitteePayload) {
    if (!this.bot) throw new Error("Bot Telegram non initialisé");

    this.publishedPayloads.set(payload.demandeId, payload);

    const results = getResults(payload.demandeId);
    const text = buildCommitteeMessage(payload, results, false);
    const keyboard = buildCommitteeKeyboard(payload.demandeId);

    const msg = await this.bot.api.sendMessage(
      this.committeeChatId,
      text,
      { reply_markup: keyboard }
    );

    this.publishedMessages.set(payload.demandeId, {
      chatId: msg.chat.id,
      messageId: msg.message_id,
    });
  }
}

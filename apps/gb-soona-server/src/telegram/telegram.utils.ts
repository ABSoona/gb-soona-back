import { InlineKeyboard } from "grammy";
import type { CommitteeVote } from "./vote.store";
import type { PublishCommitteePayload } from "./telegram.types";

/**
 * Boutons de vote (sobres, institutionnels)
 */
export function buildCommitteeKeyboard(demandeId: number) {
  return new InlineKeyboard()
    .text("✅ Accepter", `vote:${demandeId}:accept`)
    .text("⏸️ Ajourner", `vote:${demandeId}:postpone`)
    .text("🟥 Refuser", `vote:${demandeId}:reject`);
}

/**
 * Construction du message Telegram à partir d’un payload fourni par le front
 */
export function buildCommitteeMessage(
  payload: PublishCommitteePayload,
  results: { accept: number; postpone: number; reject: number },
  closed = false
): string {
  const lines: string[] = [];

  // Titre
  lines.push(`📄 ${payload.title ?? `Demande #${payload.demandeId}`}`);
  lines.push("");

  // Lignes fournies par le front
  for (const line of payload.lines) {
    lines.push(`• ${line}`);
  }
  lines.push("");
  lines.push(`🔗 Lien vers la demande :`);
  lines.push(`${payload.demandeUrl}`);
  

  // Bloc décision
  lines.push("");
  lines.push(closed ? "Vote finale du comité :" : "Vote du comité :");
  lines.push(`Accord : ${results.accept}`);
  lines.push(`Ajournement : ${results.postpone}`);
  lines.push(`Refus : ${results.reject}`);

  if (closed) {
    lines.push("");
    lines.push("Vote clôturé");
  }

  return lines.join("\n");
}

/**
 * Parsing sécurisé des callbacks de vote
 */
export function parseVoteData(
  data: string
): { demandeId: number; vote: CommitteeVote } | null {
  if (!data?.startsWith("vote:")) return null;

  const [, demandeIdRaw, voteRaw] = data.split(":");
  const demandeId = Number(demandeIdRaw);

  if (!Number.isFinite(demandeId)) return null;
  if (voteRaw !== "accept" && voteRaw !== "postpone" && voteRaw !== "reject") {
    return null;
  }

  return { demandeId, vote: voteRaw };
}

import { InlineKeyboard } from "grammy";
import type { CommitteeVote } from "./vote.store";
import type { PublishCommitteePayload } from "./telegram.types";

/**
 * Boutons de vote (sobres, institutionnels)
 */
export function buildCommitteeKeyboard(demandeId: number) {
  return new InlineKeyboard()
    .text("✅ ACCEPTER", `vote:${demandeId}:accept`)
    .text("⏸️ AJOURNER", `vote:${demandeId}:postpone`)
    .text("🟥 REFUSER", `vote:${demandeId}:reject`);
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
  lines.push(`📄 ${payload.title ?? `DEMANDE #${payload.demandeId}`}`);
  lines.push("");

  // Lignes fournies par le front
  for (const line of payload.lines) {
    lines.push(`• ${line}`);
  }

  // Bloc décision
  lines.push("");
  lines.push(closed ? "Décision finale du comité :" : "Décision du comité :");
  lines.push(`✅ ACCEPTER : ${results.accept}`);
  lines.push(`⏸️ AJOURNER : ${results.postpone}`);
  lines.push(`🟥 REFUSER : ${results.reject}`);

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

import { InlineKeyboard } from "grammy";
import type { PublishCommitteePayload } from "./telegram.types";
import type { CommitteeVote } from "./vote.store";

export function buildCommitteeKeyboard(demandeId: number) {
  return new InlineKeyboard()
    .text("👍 Accepter", `vote:${demandeId}:accept`)
    .text("🤔 Reporter", `vote:${demandeId}:postpone`)
    .text("👎 Refuser", `vote:${demandeId}:reject`);
}

export function buildMessage(payload: PublishCommitteePayload, results: { accept: number; postpone: number; reject: number }, closed = false) {
  const lines: string[] = [];

  lines.push(`📄 DEMANDE #${payload.demandeId}`);
  lines.push(`👤 ${payload.beneficiaire}`);

  if (payload.situationFam) lines.push(`👨‍👩‍👧 ${payload.situationFam}`);
  if (payload.situationPro) lines.push(`💼 ${payload.situationPro}`);
  if (typeof payload.montant === "number") lines.push(`💰 ${payload.montant} €`);
  if (payload.motif) lines.push(`📝 ${payload.motif}`);
  if (payload.createdAt) lines.push(`📅 Déposée le : ${new Date(payload.createdAt).toLocaleDateString("fr-FR")}`);

  lines.push("");
  lines.push(`📊 ${closed ? "RÉSULTAT FINAL" : "Votes"} :`);
  lines.push(`👍 ${results.accept} | 🤔 ${results.postpone} | 👎 ${results.reject}`);

  if (closed) {
    lines.push("");
    lines.push("⏰ Vote clôturé");
  }

  return lines.join("\n");
}

export function parseVoteData(data: string): { demandeId: number; vote: CommitteeVote } | null {
  if (!data?.startsWith("vote:")) return null;
  const [, demandeIdRaw, voteRaw] = data.split(":");
  const demandeId = Number(demandeIdRaw);
  if (!Number.isFinite(demandeId)) return null;

  if (voteRaw !== "accept" && voteRaw !== "postpone" && voteRaw !== "reject") return null;
  return { demandeId, vote: voteRaw };
}

export type CommitteeVote = "accept" | "postpone" | "reject";

const votes = new Map<number, Map<number, CommitteeVote>>(); // demandeId -> (telegramUserId -> vote)

export function setVote(demandeId: number, telegramUserId: number, vote: CommitteeVote) {
  if (!votes.has(demandeId)) votes.set(demandeId, new Map());
  votes.get(demandeId)!.set(telegramUserId, vote);
}

export function getResults(demandeId: number) {
  const r = { accept: 0, postpone: 0, reject: 0 };
  votes.get(demandeId)?.forEach((v) => (r[v] += 1));
  return r;
}

export function clearVotes(demandeId: number) {
  votes.delete(demandeId);
}
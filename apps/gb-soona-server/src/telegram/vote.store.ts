export type CommitteeVote = "accept" | "postpone";

const votes = new Map<number, Map<number, CommitteeVote>>(); // demandeId -> (telegramUserId -> vote)
const voterNames = new Map<number, Map<number, string>>();   // demandeId -> (telegramUserId -> username)

export function setVote(
  demandeId: number,
  telegramUserId: number,
  vote: CommitteeVote,
  username: string
) {
  if (!votes.has(demandeId)) votes.set(demandeId, new Map());
  votes.get(demandeId)!.set(telegramUserId, vote);

  if (!voterNames.has(demandeId)) voterNames.set(demandeId, new Map());
  voterNames.get(demandeId)!.set(telegramUserId, username);
}

export function getResults(demandeId: number) {
  const r = { accept: 0, postpone: 0 };
  votes.get(demandeId)?.forEach((v) => (r[v] += 1));
  return r;
}

export function getVoterNames(demandeId: number): string[] {
  return [...(voterNames.get(demandeId)?.values() ?? [])];
}

export function clearVotes(demandeId: number) {
  votes.delete(demandeId);
  voterNames.delete(demandeId);
}

// Normalise un numero de telephone francais au format "0612345678".
// Accepte les saisies avec espaces, points ou tirets, et les prefixes
// internationaux "+33" / "0033" (deja controles par @Matches dans les DTO).
// Une chaine vide devient null. Un numero non reconnu est renvoye tel quel
// (la validation des DTO l'aura deja rejete).
export function normalizeTelephone(
  telephone: string | null | undefined
): string | null | undefined {
  if (telephone === undefined || telephone === null) return telephone;
  const digits = telephone.replace(/[\s.-]/g, "");
  if (digits === "") return null;
  const national = digits.replace(/^(?:\+|00)33/, "0");
  return /^0[1-9]\d{8}$/.test(national) ? national : telephone.trim();
}

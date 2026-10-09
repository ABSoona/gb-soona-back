export function capitalizeFirstLetter(value?: string | null): string {
    if (!value) return '—';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }
  export function normalizePhone(phone?: string | null): string | null {
    if (!phone) return null;
  
    let p = phone.replace(/[^0-9+]/g, '');
  
    if (p.startsWith('+33')) p = '0' + p.slice(3);
    if (p.startsWith('0033')) p = '0' + p.slice(4);
  
    return p;
  }


  // Convertit un numero local (ex: "06 59 91 07 79") au format attendu par
  // l'API WhatsApp (indicatif pays, sans "+" : "33659910779").
  export function toWhatsAppPhone(phone?: string | null): string | null {
    if (!phone) return null;
    let p = phone.replace(/[^0-9+]/g, '');
    if (p.startsWith('+')) return p.slice(1);
    if (p.startsWith('0')) return '33' + p.slice(1);
    return p;
  }

  // Derniers chiffres d'un numero, utilises pour retrouver le contact
  // correspondant a un numero WhatsApp (formats de stockage heterogenes en
  // base : avec ou sans indicatif, espaces, points...).
  export function phoneLastDigits(phone?: string | null, n = 9): string | null {
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    return digits.slice(-n) || null;
  }

  export function buildFullSearch(contact: any): string {
    const nom = contact?.nom?.trim() ?? '';
    const prenom = contact?.prenom?.trim() ?? '';
    const email = contact?.email?.trim() ?? '';
    const telephone = contact?.telephone?.trim() ?? '';
  
    const departement =
      contact?.codePostal
        ? contact.codePostal.toString().slice(0, 2)
        : '';
  
    return [
      `${nom} ${prenom}`.trim(),
      `${prenom} ${nom}`.trim(),
      departement,
      email,
      telephone,
    ]
      .filter(Boolean)
      .join(', ');
  }
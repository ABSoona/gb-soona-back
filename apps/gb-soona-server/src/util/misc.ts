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
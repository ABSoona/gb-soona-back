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
/** Humanizes a snake_case key into a readable title */
export const humanizeKey = (key: string): string =>
  key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

/** Formats a monetary amount with currency via Intl */
export const formatMoney = (amount: number, currency?: string | null): string => {
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency || 'MAD',
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString('fr-FR')} ${currency || ''}`;
  }
};

/** Formats a date string (ISO 8601) into a readable locale date */
export const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return new Intl.DateTimeFormat('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
};

/** Truncates filename for display */
export const truncateFilename = (filename: string, maxLength = 30): string => {
  const name = filename.replace('.json', '');
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 3) + '...';
};

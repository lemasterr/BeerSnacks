// Store defaults: opening hours (index 0 = Monday … 6 = Sunday, "HH:MM-HH:MM" or "" = closed)
// and whether the store takes pickup orders. Filled in for settings saved before these fields existed.
export const STORE_DEFAULTS = {
  stock_mahtra: { pickup: true, hours: ['11:00-20:00', '11:00-20:00', '11:00-20:00', '11:00-20:00', '11:00-20:00', '11:00-18:00', '11:00-18:00'] },
  stock_oismae: { pickup: false, hours: ['13:00-22:00', '13:00-22:00', '13:00-22:00', '13:00-22:00', '13:00-22:00', '11:00-22:00', '11:00-22:00'] },
};

const RANGE = /^([01]\d|2[0-3]):([0-5]\d)-([01]\d|2[0-4]):([0-5]\d)$/;

// "11.00 – 20.00" → "11:00-20:00"; "" stays closed; anything else → null (invalid)
export function normalizeRange(v) {
  const s = String(v ?? '').trim().replace(/[–—]/g, '-').replace(/\s+/g, '').replace(/\./g, ':')
    .replace(/^(\d):/, '0$1:').replace(/-(\d):/, '-0$1:');
  if (!s || /^(-|закрыто|suletud|closed)$/i.test(s)) return '';
  const m = s.match(RANGE);
  if (!m) return null;
  return m[1] * 60 + +m[2] < m[3] * 60 + +m[4] ? s : null;
}

export function withStoreDefaults(settings) {
  if (!settings || !Array.isArray(settings.stores)) return settings;
  return {
    ...settings,
    stores: settings.stores.map(st => {
      const d = STORE_DEFAULTS[st.field] || { pickup: false, hours: Array(7).fill('') };
      return {
        ...st,
        pickup: typeof st.pickup === 'boolean' ? st.pickup : d.pickup,
        hours: Array.isArray(st.hours) && st.hours.length === 7 ? st.hours : d.hours,
      };
    }),
  };
}

export function roundCents(value: number): number {
  const clean = Number(value.toPrecision(12));
  return Math.sign(clean) * Math.round(Math.abs(clean)) + 0;
}

const MONEY_INPUT = /^\d*(\.\d{0,2})?$/;

export function isMoneyDraft(raw: string): boolean {
  return MONEY_INPUT.test(raw);
}

export function parseMoneyInput(raw: string): number | null {
  const s = raw.trim().replace(/[$,\s]/g, '');
  if (s === '' || s === '.' || !MONEY_INPUT.test(s)) return null;
  const [whole = '', frac = ''] = s.split('.');
  return Number(whole || '0') * 100 + Number(frac.padEnd(2, '0'));
}

export function centsToInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

export function formatUSD(cents: number): string {
  return usd.format(cents / 100);
}

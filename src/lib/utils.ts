/** Formats a number as USD currency with up to two decimals. */
export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2
  }).format(value);

/** Formats a signed percentage string with two decimal places. */
export const formatPercent = (value: number): string => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;

const trimTrailingZero = (value: string): string => value.replace(/\.0$/, '');

/** Formats large values into compact K/M/B/T notation. */
export const formatCompact = (value: number, fractionDigits = 1): string => {
  const absolute = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absolute >= 1_000_000_000_000) return `${sign}${trimTrailingZero((absolute / 1_000_000_000_000).toFixed(fractionDigits))}T`;
  if (absolute >= 1_000_000_000) return `${sign}${trimTrailingZero((absolute / 1_000_000_000).toFixed(fractionDigits))}B`;
  if (absolute >= 1_000_000) return `${sign}${trimTrailingZero((absolute / 1_000_000).toFixed(fractionDigits))}M`;
  if (absolute >= 1_000) return `${sign}${trimTrailingZero((absolute / 1_000).toFixed(fractionDigits))}K`;
  return `${sign}${trimTrailingZero(absolute.toFixed(fractionDigits))}`;
};

/** Alias for compact number formatting used in metrics UI. */
export const formatLargeNumber = (value: number): string => formatCompact(value);

/** Formats a Unix timestamp (seconds) into a short US date label. */
export const formatDateLabel = (unixTimestamp: number): string =>
  new Date(unixTimestamp * 1000).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

/** Joins truthy class names into a single space-delimited string. */
export const cn = (...classes: Array<string | false | null | undefined>): string => classes.filter(Boolean).join(' ');

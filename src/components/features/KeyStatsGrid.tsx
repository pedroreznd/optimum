import { useMemo } from 'react';
import { getMockQuote } from '@/api/mockData';
import { formatCompact, formatCurrency, formatPercent } from '@/lib/utils';
import type { CandleDataPoint } from '@/types/finnhub';

interface KeyStatsGridProps {
  symbol: string;
  candles: CandleDataPoint[];
}

interface StatItem {
  label: string;
  value: string;
  valueClassName?: string;
}

const getSeed = (symbol: string): number => {
  const firstCode = symbol.charCodeAt(0) || 65;
  return firstCode * 17 + symbol.length * 13;
};

const seededRange = (seed: number, min: number, max: number, offset: number): number => {
  const normalized = ((seed + offset * 37) % 1000) / 1000;
  return min + (max - min) * normalized;
};

const getSma = (candles: CandleDataPoint[], period: number): number | null => {
  if (candles.length < period) return null;
  const slice = candles.slice(-period);
  const total = slice.reduce((sum, candle) => sum + candle.close, 0);
  return total / period;
};

const getSignedPercent = (value: number | null): string => {
  if (value === null) return '--';
  return formatPercent(value);
};

export default function KeyStatsGrid({ symbol, candles }: KeyStatsGridProps): JSX.Element {
  const quoteSnapshot = useMemo(() => getMockQuote(symbol), [symbol]);

  const stats = useMemo<StatItem[]>(() => {
    const closes = candles.map((candle) => candle.close);
    const highs = candles.map((candle) => candle.high ?? candle.close);
    const lows = candles.map((candle) => candle.low ?? candle.close);
    const volumes = candles.map((candle) => candle.volume);

    const currentClose = closes.length > 0 ? closes[closes.length - 1] ?? null : null;
    const currentPrice = quoteSnapshot.c ?? currentClose;
    const high52 = highs.length > 0 ? Math.max(...highs) : null;
    const low52 = lows.length > 0 ? Math.min(...lows) : null;
    const avgVolume = volumes.length > 0 ? volumes.reduce((sum, value) => sum + value, 0) / volumes.length : null;

    const changes: number[] = [];
    for (let i = 1; i < closes.length; i += 1) {
      const previous = closes[i - 1];
      const current = closes[i];
      if (previous === undefined || current === undefined || previous === 0) continue;
      changes.push(((current - previous) / previous) * 100);
    }

    const volatility = (() => {
      if (changes.length === 0) return null;
      const mean = changes.reduce((sum, value) => sum + value, 0) / changes.length;
      const variance = changes.reduce((sum, value) => sum + (value - mean) ** 2, 0) / changes.length;
      return Math.sqrt(variance);
    })();

    const sma20 = getSma(candles, 20);
    const sma50 = getSma(candles, 50);

    const priceVsSma20 =
      currentPrice !== null && sma20 !== null && sma20 !== 0
        ? ((currentPrice - sma20) / sma20) * 100
        : null;

    const priceVsSma50 =
      currentPrice !== null && sma50 !== null && sma50 !== 0
        ? ((currentPrice - sma50) / sma50) * 100
        : null;

    const close10Ago = closes.length > 10 ? closes[closes.length - 11] ?? null : null;
    const momentum10d =
      currentPrice !== null && close10Ago !== null && close10Ago !== 0
        ? ((currentPrice - close10Ago) / close10Ago) * 100
        : null;

    const seed = getSeed(symbol);
    const pe = seededRange(seed, 10, 45, 1);
    const eps = seededRange(seed, 0.5, 12, 2);
    const beta = seededRange(seed, 0.4, 2.2, 3);
    const dividendYield = seededRange(seed, 0, 4.5, 4);

    const colorForSignedPercent = (value: number | null): string => {
      if (value === null) return 'text-text-secondary';
      return value >= 0 ? 'text-positive' : 'text-negative';
    };

    return [
      {
        label: '52W High',
        value: high52 === null ? '--' : formatCurrency(high52)
      },
      {
        label: '52W Low',
        value: low52 === null ? '--' : formatCurrency(low52)
      },
      {
        label: 'Avg Volume',
        value: avgVolume === null ? '--' : formatCompact(avgVolume)
      },
      {
        label: 'Volatility',
        value: volatility === null ? '--' : `${volatility.toFixed(2)}%`
      },
      {
        label: 'Price vs SMA20',
        value: getSignedPercent(priceVsSma20),
        valueClassName: colorForSignedPercent(priceVsSma20)
      },
      {
        label: 'Price vs SMA50',
        value: getSignedPercent(priceVsSma50),
        valueClassName: colorForSignedPercent(priceVsSma50)
      },
      {
        label: 'Momentum (10d)',
        value: getSignedPercent(momentum10d),
        valueClassName: colorForSignedPercent(momentum10d)
      },
      {
        label: 'Data Points',
        value: String(candles.length)
      },
      {
        label: 'P/E',
        value: pe.toFixed(1)
      },
      {
        label: 'EPS',
        value: eps.toFixed(2)
      },
      {
        label: 'Beta',
        value: beta.toFixed(2)
      },
      {
        label: 'Dividend Yield',
        value: `${dividendYield.toFixed(2)}%`
      }
    ];
  }, [candles, quoteSnapshot, symbol]);

  return (
    <div className="flex h-full flex-col bg-background-surface">
      <div className="grid grid-cols-2 md:grid-cols-4">
        {stats.map((item) => (
          <div key={item.label} className="border-b border-r border-border-subtle px-4 py-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-text-muted">{item.label}</p>
            <p className={`font-mono text-sm font-medium ${item.valueClassName ?? 'text-text-primary'}`}>{item.value}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-border-subtle px-4 py-2">
        <p className="text-[10px] text-text-muted">
          Statistical values derived from available candle data. P/E, EPS, Beta and Dividend Yield are simulated for demonstration purposes.
        </p>
      </div>
    </div>
  );
}

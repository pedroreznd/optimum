import { useEffect, useMemo, useRef, useState } from 'react';
import { getMockQuote } from '@/api/mockData';
import Skeleton from '@/components/ui/Skeleton';
import Sparkline from '@/components/ui/Sparkline';
import { useToastStore } from '@/components/ui/Toast';
import { useMarketDataStore } from '@/store/marketDataStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import { useSparkline } from '@/hooks/useSparkline';
import { formatCurrency } from '@/lib/utils';

interface WatchlistProps {
  activeSymbol: string | null;
  onOpenTab: (symbol: string) => void;
}

interface SparklineItemProps {
  symbol: string;
}

function SparklineItem({ symbol }: SparklineItemProps): JSX.Element {
  const closes = useSparkline(symbol);

  if (closes.length < 2) {
    return <Skeleton className="h-7 w-20" />;
  }

  const first = closes[0]!;
  const last = closes[closes.length - 1]!;
  const positive = last >= first;

  return <Sparkline prices={closes} positive={positive} width={80} height={28} />;
}

export default function Watchlist({ activeSymbol, onOpenTab }: WatchlistProps): JSX.Element {
  const { symbols, removeSymbol } = useWatchlistStore();
  const latestTrades = useMarketDataStore((state) => state.latestTrades);
  const pushToast = useToastStore((state) => state.pushToast);

  const [query, setQuery] = useState('');

  const filteredSymbols = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return symbols;
    return symbols.filter((s) => s.toLowerCase().includes(normalized));
  }, [symbols, query]);

  const previousPrices = useRef<Record<string, number>>({});
  const currentPrices = useRef<Record<string, number>>({});
  const quoteRangeRef = useRef<Record<string, { h: number; l: number }>>({});

  useEffect(() => {
    symbols.forEach((symbol) => {
      const trade = latestTrades[symbol];
      if (!trade) return;

      const current = currentPrices.current[symbol];
      if (current === undefined) {
        currentPrices.current[symbol] = trade.p;
        previousPrices.current[symbol] = trade.p;
        return;
      }

      if (current !== trade.p) {
        previousPrices.current[symbol] = current;
        currentPrices.current[symbol] = trade.p;
      }
    });
  }, [symbols, latestTrades]);

  useEffect(() => {
    symbols.forEach((symbol) => {
      const quote = getMockQuote(symbol);
      quoteRangeRef.current[symbol] = { h: quote.h, l: quote.l };
    });
  }, [symbols]);

  return (
    <section className="flex h-full flex-col">
      <div className="sticky top-0 z-10 border-b border-border-subtle bg-background-base px-3 py-2">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-text-secondary">Watchlist</p>
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">
            DEMO
          </span>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        {symbols.length === 0 ? (
          <p className="px-3 py-3 text-xs text-text-secondary">No symbols in watchlist.</p>
        ) : filteredSymbols.length === 0 ? (
          <p className="px-3 py-3 text-xs text-text-secondary">No matches.</p>
        ) : (
          <ul className="pb-12">
            {filteredSymbols.map((symbol) => {
              const trade = latestTrades[symbol];
              const current = currentPrices.current[symbol];
              const previous = previousPrices.current[symbol];
              const range = quoteRangeRef.current[symbol];

              const changePercent =
                current !== undefined && previous !== undefined && previous !== 0
                  ? ((current - previous) / previous) * 100
                  : null;
              const changeColor =
                changePercent === null
                  ? 'text-text-secondary'
                  : changePercent >= 0
                    ? 'text-positive'
                    : 'text-negative';

              return (
                <li
                  key={symbol}
                  className="border-b border-border-subtle"
                  onClick={() => {
                    if (window.innerWidth < 640) {
                      onOpenTab(symbol);
                    }
                  }}
                >
                  <div className="flex min-h-9 items-center justify-between px-3 py-2 sm:hidden">
                    <span className="font-mono text-sm text-accent">{symbol}</span>
                    {trade && current !== undefined ? (
                      <span className="font-mono text-sm text-text-primary">
                        {formatCurrency(current)}
                      </span>
                    ) : (
                      <Skeleton className="h-4 w-14" />
                    )}
                    <span className={`font-mono text-xs ${changeColor}`}>
                      {changePercent === null
                        ? '--'
                        : `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`}
                    </span>
                    <button
                      className="ml-2 inline-flex h-9 items-center px-1 text-base leading-none text-text-secondary hover:text-text-primary"
                      onClick={(event) => {
                        event.stopPropagation();
                        removeSymbol(symbol);
                        pushToast(`${symbol} removed from watchlist`);
                      }}
                      aria-label={`Remove ${symbol}`}
                    >
                      ×
                    </button>
                  </div>

                  <div className="hidden flex-col gap-1 px-3 py-2.5 sm:flex">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => onOpenTab(symbol)}
                        className={`text-left font-mono text-sm font-medium ${
                          activeSymbol === symbol
                            ? 'text-accent'
                            : 'text-text-primary hover:text-accent'
                        }`}
                      >
                        {symbol}
                      </button>

                      {trade && current !== undefined ? (
                        <span className="font-mono text-sm text-text-primary">
                          {formatCurrency(current)}
                        </span>
                      ) : (
                        <Skeleton className="h-4 w-14" />
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-4">
                        <div className="flex items-baseline gap-1">
                          <span className="font-mono text-[10px] text-text-muted">Chg:</span>
                          <span className={`font-mono text-xs ${changeColor}`}>
                            {changePercent === null
                              ? '--'
                              : `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`}
                          </span>
                        </div>
                        {/* <div className="flex items-baseline gap-1">
                          <span className="font-mono text-[10px] text-text-muted">H:</span>
                          <span className="font-mono text-xs text-text-primary">
                            {range ? formatCurrency(range.h) : '--'}
                          </span>
                        </div>
                        <div className="flex items-baseline gap-1">
                          <span className="font-mono text-[10px] text-text-muted">L:</span>
                          <span className="font-mono text-xs text-text-primary">
                            {range ? formatCurrency(range.l) : '--'}
                          </span>
                        </div> */}
                      </div>
                      <div className="ml-auto">
                        <SparklineItem symbol={symbol} />
                      </div>
                    </div>

                    <div className="mt-1 flex items-center gap-3">
                      <button
                        className="text-xs text-text-secondary hover:text-text-primary"
                        onClick={(event) => {
                          event.stopPropagation();
                          onOpenTab(symbol);
                        }}
                      >
                        Open
                      </button>
                      <button
                        className="text-xs text-text-secondary hover:text-text-primary"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeSymbol(symbol);
                          pushToast(`${symbol} removed from watchlist`);
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

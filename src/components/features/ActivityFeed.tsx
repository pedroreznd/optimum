import { useEffect, useMemo, useRef } from 'react';
import Skeleton from '@/components/ui/Skeleton';
import { useRecentTrades } from '@/hooks/useRecentTrades';
import { formatCompact, formatCurrency } from '@/lib/utils';

interface ActivityFeedProps {
  symbol: string;
}

const getTradeSignature = (price: number, volume: number, timestamp: number): string =>
  `${timestamp}-${price}-${volume}`;

const formatTime = (timestamp: number): string =>
  new Date(timestamp).toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

export default function ActivityFeed({ symbol }: ActivityFeedProps): JSX.Element {
  const { trades, loading, error } = useRecentTrades(symbol);
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    seenRef.current = new Set();
  }, [symbol]);

  const rows = useMemo(() => {
    const seenSnapshot = new Set(seenRef.current);

    return trades.map((trade, index) => {
      const signature = getTradeSignature(trade.price, trade.volume, trade.timestamp);
      const previous = trades[index + 1];
      const isNew = !seenSnapshot.has(signature);
      seenSnapshot.add(signature);

      const trendColor =
        !previous || trade.price === previous.price
          ? 'border-l-border-muted'
          : trade.price > previous.price
            ? 'border-l-positive'
            : 'border-l-negative';

      return {
        signature,
        trendColor,
        isNew,
        trade,
      };
    });
  }, [trades]);

  useEffect(() => {
    const next = new Set(seenRef.current);
    trades.forEach((trade) => {
      next.add(getTradeSignature(trade.price, trade.volume, trade.timestamp));
    });
    seenRef.current = next;
  }, [trades]);

  const tradeGridClass =
    'grid-cols-[minmax(90px,1.1fr)_minmax(64px,0.7fr)_minmax(120px,1.2fr)_minmax(110px,1fr)_minmax(120px,1.1fr)]';

  return (
    <section className="flex h-full flex-col bg-background-surface">
      <header className="flex h-9 items-center justify-between border-b border-border-subtle px-3">
        <p className="text-xs uppercase tracking-widest text-text-secondary">Recent Trades</p>
        {!loading && (
          <span className="font-mono text-[10px] uppercase tracking-widest text-text-secondary">
            DEMO
          </span>
        )}
      </header>

      <div className="hide-scrollbar flex-1 overflow-auto">
        {/* Force horizontal scroll only when needed */}
        <div className="min-w-[620px]">
          <div
            className={`sticky top-0 z-10 grid w-full ${tradeGridClass} items-center border-b border-l-2 border-l-transparent border-border-subtle bg-background-base py-1`}
          >
            <p className="px-3 font-mono text-[10px] uppercase tracking-widest text-white">Price</p>
            <p className="px-2 font-mono text-[10px] uppercase tracking-widest text-white">Size</p>
            <p className="px-2 font-mono text-[10px] uppercase tracking-widest text-white">Value</p>
            <p className="px-2 font-mono text-[10px] uppercase tracking-widest text-white">Time</p>
            <p className="px-2 font-mono text-[10px] uppercase tracking-widest text-white">
              Conditions
            </p>
          </div>

          {loading && (
            <div>
              {Array.from({ length: 8 }).map((_, index) => (
                <div key={index} className="border-b border-border-subtle px-3 py-1.5">
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="flex h-full items-center justify-center text-xs text-negative">
              Failed to load trades
            </div>
          )}

          {!loading && !error && trades.length === 0 && (
            <div className="flex h-full items-center justify-center text-xs text-text-secondary">
              No trades available
            </div>
          )}

          {!loading &&
            !error &&
            rows.map(({ signature, trendColor, isNew, trade }) => (
              <div
                key={signature}
                className={`border-b border-l-2 border-border-subtle ${trendColor} ${
                  isNew ? 'animate-[fadeIn_180ms_ease-out]' : ''
                }`}
              >
                <div className={`grid w-full ${tradeGridClass} items-center`}>
                  <p className="px-3 py-1.5 font-mono text-xs text-text-primary">
                    {formatCurrency(trade.price)}
                  </p>
                  <p className="px-2 py-1.5 font-mono text-xs text-text-secondary">
                    {formatCompact(trade.volume)}
                  </p>
                  <p className="px-2 py-1.5 font-mono text-xs text-text-secondary">
                    {formatCurrency(trade.price * trade.volume)}
                  </p>
                  <p className="px-2 py-1.5 font-mono text-xs text-text-muted">
                    {formatTime(trade.timestamp)}
                  </p>
                  <p className="truncate px-2 py-1.5 font-mono text-xs text-text-muted">
                    {trade.conditions[0] ?? '—'}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}

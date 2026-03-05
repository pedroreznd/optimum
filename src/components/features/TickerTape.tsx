import React, { useCallback, useEffect, useRef, useState } from 'react';
import Marquee from 'react-fast-marquee';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { latestTradesCache, useMarketDataStore } from '@/store/marketDataStore';

interface TickerTapeProps {
  onOpenTab: (symbol: string) => void;
}

interface TickerItemProps {
  symbol: string;
  onOpenTab: (symbol: string) => void;
  registerRefs: (symbol: string, refs: { price: HTMLSpanElement; change: HTMLSpanElement }) => void;
  unregisterRefs: (
    symbol: string,
    refs: { price: HTMLSpanElement; change: HTMLSpanElement },
  ) => void;
}

interface TickerItemRefs {
  price: HTMLSpanElement;
  change: HTMLSpanElement;
  prevPrice: number | null;
  lastColorClass: string;
}

export const TICKER_SYMBOLS = [
  'AAPL',
  'MSFT',
  'NVDA',
  'GOOGL',
  'AMZN',
  'META',
  'TSLA',
  'JPM',
  'V',
  'UNH',
  'XOM',
  'WMT',
  'JNJ',
  'MA',
  'PG',
];

const getPriceWidth = (symbol: string): string => {
  // const highPrice = ['NVDA', 'GOOGL', 'AMZN', 'META', 'TSLA'];
  const midPrice = ['AAPL', 'MSFT', 'JPM', 'V', 'MA', 'UNH', 'XOM', 'WMT'];
  if (midPrice.includes(symbol)) return 'w-[84px]';
  return 'w-20';
};

const TickerItem = React.memo(
  function TickerItem({
    symbol,
    onOpenTab,
    registerRefs,
    unregisterRefs,
  }: TickerItemProps): JSX.Element {
    const priceRef = useRef<HTMLSpanElement>(null);
    const changeRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
      if (priceRef.current && changeRef.current) {
        registerRefs(symbol, { price: priceRef.current, change: changeRef.current });
      }
      return () => {
        if (priceRef.current && changeRef.current) {
          unregisterRefs(symbol, { price: priceRef.current, change: changeRef.current });
        }
      };
    }, [registerRefs, symbol, unregisterRefs]);

    return (
      <span className="mr-0 inline-flex h-9 min-w-52 max-w-52 items-center justify-center gap-0 font-mono text-xs border-r border-border-subtle">
        <button
          className="text-accent hover:text-text-primary w-fit text-left"
          onClick={() => onOpenTab(symbol)}
        >
          {symbol}
        </button>
        <span
          ref={priceRef}
          className={`font-mono text-xs text-text-primary block text-center px-2 ${getPriceWidth(symbol)}`}
        >
          {''}
        </span>
        <span
          ref={changeRef}
          className={`font-mono text-xs text-text-secondary block text-right w-16`}
        >
          {''}
        </span>
      </span>
    );
  },
  () => true,
);

export default function TickerTape({ onOpenTab }: TickerTapeProps): JSX.Element {
  const itemRefsMap = useRef<Map<string, TickerItemRefs[]>>(new Map());
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  const registerRefs = useCallback(
    (symbol: string, refs: { price: HTMLSpanElement; change: HTMLSpanElement }) => {
      const existingRefs = itemRefsMap.current.get(symbol) ?? [];
      if (existingRefs.some((item) => item.price === refs.price && item.change === refs.change)) {
        return;
      }

      const entry: TickerItemRefs = {
        ...refs,
        prevPrice: null,
        lastColorClass: 'text-text-secondary',
      };
      existingRefs.push(entry);
      itemRefsMap.current.set(symbol, existingRefs);

      const currentTrade = latestTradesCache[symbol];
      if (currentTrade) {
        refs.price.textContent = formatCurrency(currentTrade.p);
        entry.prevPrice = currentTrade.p;
      }
    },
    [],
  );

  const unregisterRefs = useCallback(
    (symbol: string, refs: { price: HTMLSpanElement; change: HTMLSpanElement }) => {
      const existingRefs = itemRefsMap.current.get(symbol);
      if (!existingRefs) return;

      const filtered = existingRefs.filter(
        (item) => item.price !== refs.price || item.change !== refs.change,
      );
      if (filtered.length === 0) {
        itemRefsMap.current.delete(symbol);
        return;
      }

      itemRefsMap.current.set(symbol, filtered);
    },
    [],
  );

  useEffect(() => {
    const applyTrades = (latestTrades: Record<string, { p: number }>): void => {
      TICKER_SYMBOLS.forEach((symbol) => {
        const trade = latestTrades[symbol];
        if (!trade) return;

        const refsList = itemRefsMap.current.get(symbol);
        if (!refsList || refsList.length === 0) return;

        refsList.forEach((refs) => {
          const currentPrice = trade.p;
          const previousPrice = refs.prevPrice;

          refs.price.textContent = formatCurrency(currentPrice);

          if (previousPrice === null) {
            refs.prevPrice = currentPrice;
            return;
          }

          if (currentPrice === previousPrice) return;

          const changePercent =
            previousPrice !== 0 ? ((currentPrice - previousPrice) / previousPrice) * 100 : 0;
          const nextColorClass = currentPrice > previousPrice ? 'text-positive' : 'text-negative';

          refs.lastColorClass = nextColorClass;
          refs.prevPrice = currentPrice;
          refs.change.className = `font-mono text-xs ${nextColorClass}`;
          refs.change.textContent = formatPercent(changePercent);
        });
      });
    };

    const unsub = useMarketDataStore.subscribe(() => {
      applyTrades(latestTradesCache);
    });

    return unsub;
  }, []); // subscribe once, never resubscribe

  useEffect(() => {
    const checkOverflow = (): void => {
      if (!containerRef.current || !contentRef.current) return;
      setShouldScroll(contentRef.current.offsetWidth > containerRef.current.offsetWidth);
    };

    const timeoutId = window.setTimeout(checkOverflow, 100);
    const observer = new ResizeObserver(() => {
      checkOverflow();
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    if (contentRef.current) {
      observer.observe(contentRef.current);
    }

    return () => {
      window.clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [TICKER_SYMBOLS.length]);

  return (
    <section className="sticky top-0 z-20 h-9 overflow-hidden border-b border-border-subtle bg-background-base">
      <div ref={containerRef} className="h-full overflow-hidden">
        <Marquee speed={36} gradient={false} pauseOnHover autoFill>
          {TICKER_SYMBOLS.map((symbol) => (
            <TickerItem
              key={symbol}
              symbol={symbol}
              onOpenTab={onOpenTab}
              registerRefs={registerRefs}
              unregisterRefs={unregisterRefs}
            />
          ))}
        </Marquee>
      </div>
    </section>
  );
}

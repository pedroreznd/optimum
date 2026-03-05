import { useEffect, useMemo } from 'react';
import { TICKER_SYMBOLS } from '@/components/features/TickerTape';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useWatchlistStore } from '@/store/watchlistStore';
import { useMarketDataStore } from '@/store/marketDataStore';

export default function MarketDataProvider(): null {
  const watchlistSymbols = useWatchlistStore((state) => state.symbols);
  const setTrade = useMarketDataStore((state) => state.setTrade);
  const allSymbols = useMemo(
    () => Array.from(new Set([...TICKER_SYMBOLS, ...watchlistSymbols])),
    [watchlistSymbols],
  );
  const { latestTrades } = useWebSocket({ symbols: allSymbols, enabled: true });

  useEffect(() => {
    Object.entries(latestTrades).forEach(([symbol, trade]) => {
      if (trade) {
        setTrade(symbol, trade.p);
      }
    });
  }, [latestTrades, setTrade]);

  return null;
}

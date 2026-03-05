import { useEffect, useMemo, useState } from 'react';
import { fetchRecentTrades, type TradeItem } from '@/api/trades';

interface UseRecentTradesResult {
  trades: TradeItem[];
  loading: boolean;
  error: string | null;
}

const tradeSignature = (trade: TradeItem): string => `${trade.timestamp}-${trade.price}-${trade.volume}`;

export const useRecentTrades = (symbol: string): UseRecentTradesResult => {
  const [trades, setTrades] = useState<TradeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!symbol) {
      setTrades([]);
      setLoading(false);
      setError(null);
      return;
    }

    let active = true;

    const load = async (initial: boolean): Promise<void> => {
      if (initial) {
        setLoading(true);
      }
      setError(null);

      try {
        const nextTrades = await fetchRecentTrades(symbol);

        if (!active) return;

        setTrades((prev) => {
          if (initial) return nextTrades.slice(0, 50);

          const previousSet = new Set(prev.map(tradeSignature));
          const newItems = nextTrades.filter((item) => !previousSet.has(tradeSignature(item)));
          const merged = [...newItems, ...prev].sort((a, b) => b.timestamp - a.timestamp);
          return merged.slice(0, 50);
        });
      } catch {
        if (!active) return;
        setError('Failed to load trades');
      } finally {
        if (active && initial) {
          setLoading(false);
        }
      }
    };

    setTrades([]);
    void load(true);

    const intervalId = window.setInterval(() => {
      void load(false);
    }, 15000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [symbol]);

  return useMemo(
    () => ({
      trades,
      loading,
      error
    }),
    [trades, loading, error]
  );
};

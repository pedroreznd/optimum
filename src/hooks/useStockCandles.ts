import { useEffect, useState } from 'react';
import { getCandles } from '@/api/finnhub';
import type { FinnhubCandles, Timeframe } from '@/types/finnhub';

interface UseStockCandlesResult {
  candles: FinnhubCandles | null;
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
}

export const useStockCandles = (symbol: string, timeframe: Timeframe): UseStockCandlesResult => {
  const [candles, setCandles] = useState<FinnhubCandles | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadCandles = async (): Promise<void> => {
      if (!symbol) {
        setCandles(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getCandles(symbol, timeframe);
        if (active) setCandles(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load chart data');
          setCandles(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadCandles();

    return () => {
      active = false;
    };
  }, [symbol, timeframe]);

  return {
    candles,
    loading,
    error,
    isEmpty: !loading && !error && candles !== null && candles.s === 'no_data'
  };
};

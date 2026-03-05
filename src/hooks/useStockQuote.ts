import { useEffect, useState } from 'react';
import { getQuote } from '@/api/finnhub';
import type { FinnhubQuote } from '@/types/finnhub';

interface UseStockQuoteResult {
  quote: FinnhubQuote | null;
  loading: boolean;
  error: string | null;
  isEmpty: boolean;
}

export const useStockQuote = (symbol: string, intervalMs = 5000): UseStockQuoteResult => {
  const [quote, setQuote] = useState<FinnhubQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadQuote = async (): Promise<void> => {
      if (!symbol) {
        setQuote(null);
        setError(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const data = await getQuote(symbol);
        if (active) setQuote(data);
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : 'Failed to load quote');
          setQuote(null);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadQuote();
    const intervalId = window.setInterval(() => {
      void loadQuote();
    }, intervalMs);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [symbol, intervalMs]);

  return {
    quote,
    loading,
    error,
    isEmpty: !loading && !error && quote === null
  };
};

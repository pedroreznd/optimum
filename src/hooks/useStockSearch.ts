import { useEffect, useMemo, useState } from 'react';
import { searchStocks } from '@/api/finnhub';
import type { FinnhubSearchResult } from '@/types/finnhub';

interface UseStockSearchResult {
  query: string;
  setQuery: (value: string) => void;
  loading: boolean;
  error: string | null;
  data: FinnhubSearchResult[];
  isEmpty: boolean;
}

export const useStockSearch = (debounceMs = 350): UseStockSearchResult => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<FinnhubSearchResult[]>([]);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setData([]);
      setLoading(false);
      setError(null);
      return;
    }

    const timeout = window.setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await searchStocks(trimmed);
        setData(response.result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        setData([]);
      } finally {
        setLoading(false);
      }
    }, debounceMs);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [query, debounceMs]);

  const isEmpty = useMemo(() => !loading && !error && query.trim().length > 0 && data.length === 0, [loading, error, query, data]);

  return {
    query,
    setQuery,
    loading,
    error,
    data,
    isEmpty
  };
};

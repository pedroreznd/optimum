import { useEffect, useState } from 'react';
import { getCandles } from '@/api/finnhub';

export const useSparkline = (symbol: string): number[] => {
  const [closes, setCloses] = useState<number[]>([]);

  useEffect(() => {
    if (!symbol) return;

    let active = true;

    const load = async (): Promise<void> => {
      try {
        const candles = await getCandles(symbol, '1D');
        if (!active) return;

        if (candles.s === 'ok' && Array.isArray(candles.c)) {
          setCloses(candles.c);
        }
      } catch {}
    };

    void load();

    return () => {
      active = false;
    };
  }, [symbol]);

  return closes;
};

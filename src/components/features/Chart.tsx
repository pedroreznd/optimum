import { useEffect, useMemo, useRef, useState } from 'react';
import {
  createChart,
  type IChartApi,
  type ISeriesApi,
  LineSeries,
  CandlestickSeries,
} from 'lightweight-charts';
import Button from '@/components/ui/Button';
import Skeleton from '@/components/ui/Skeleton';
import { useStockCandles } from '@/hooks/useStockCandles';
import type { MainChartSyncBridge } from '@/lib/chartSync';
import { theme } from '@/lib/theme';
import type { CandleDataPoint, Timeframe } from '@/types/finnhub';

interface ChartProps {
  symbol: string;
  onCandlesChange?: (candles: CandleDataPoint[]) => void;
  onSyncBridgeChange?: (bridge: MainChartSyncBridge | null) => void;
}

type ChartMode = 'line' | 'candles';

const TIMEFRAMES: Timeframe[] = ['1D', '1W', '1M', '3M'];

export default function Chart({
  symbol,
  onCandlesChange,
  onSyncBridgeChange,
}: ChartProps): JSX.Element {
  const [timeframe, setTimeframe] = useState<Timeframe>('1D');
  const [mode, setMode] = useState<ChartMode>('candles');
  const { candles, loading, error, isEmpty } = useStockCandles(symbol, timeframe);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Line' | 'Candlestick'> | null>(null);
  const closeValueMapRef = useRef<Map<number, number>>(new Map<number, number>());

  const normalizedCandles = useMemo<CandleDataPoint[]>(
    () =>
      candles?.t
        .map((time, index) => {
          const open = candles.o[index];
          const high = candles.h[index];
          const low = candles.l[index];
          const close = candles.c[index];
          const volume = candles.v[index];

          if ([open, high, low, close, volume].some((value) => value === undefined)) return null;

          return {
            time,
            open,
            high,
            low,
            close,
            volume,
          };
        })
        .filter((item): item is CandleDataPoint => item !== null) ?? [],
    [candles],
  );

  const lineData = useMemo(
    () =>
      normalizedCandles.map((point) => ({
        time: point.time as never,
        value: point.close,
      })),
    [normalizedCandles],
  );

  const candleData = useMemo(
    () =>
      normalizedCandles.map((point) => ({
        time: point.time as never,
        open: point.open,
        high: point.high,
        low: point.low,
        close: point.close,
      })),
    [normalizedCandles],
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { color: theme.background.surface },
        textColor: theme.text.secondary,
      },
      grid: {
        vertLines: { color: theme.border.subtle },
        horzLines: { color: theme.border.subtle },
      },
      rightPriceScale: {
        borderColor: theme.border.subtle,
      },
      timeScale: {
        borderColor: theme.border.subtle,
      },
    });

    chartRef.current = chart;

    const bridge: MainChartSyncBridge = {
      chart,
      getSeries: () => seriesRef.current,
      getValueAtTime: (time) => closeValueMapRef.current.get(time) ?? null,
    };

    onSyncBridgeChange?.(bridge);

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
      onSyncBridgeChange?.(null);
    };
  }, [onSyncBridgeChange]);

  useEffect(() => {
    closeValueMapRef.current = new Map(normalizedCandles.map((point) => [point.time, point.close]));
    onCandlesChange?.(normalizedCandles);
  }, [normalizedCandles, onCandlesChange]);

  useEffect(() => {
    if (!chartRef.current || loading || error || normalizedCandles.length === 0) return;

    if (seriesRef.current) {
      chartRef.current.removeSeries(seriesRef.current);
      seriesRef.current = null;
    }

    if (mode === 'line') {
      const lineSeries = chartRef.current.addSeries(LineSeries, {
        color: theme.accent.DEFAULT,
        lineWidth: 2,
      });
      lineSeries.setData(lineData);
      seriesRef.current = lineSeries;
    } else {
      const candlestickSeries = chartRef.current.addSeries(CandlestickSeries, {
        upColor: theme.positive,
        downColor: theme.negative,
        wickUpColor: theme.positive,
        wickDownColor: theme.negative,
        borderVisible: false,
      });
      candlestickSeries.setData(candleData);
      seriesRef.current = candlestickSeries;
    }

    chartRef.current.timeScale().fitContent();
  }, [normalizedCandles, mode, loading, error, lineData, candleData]);

  return (
    <section className="flex min-h-0 flex-col bg-background-surface lg:flex-1">
      <div className="flex flex-shrink-0 flex-wrap items-center justify-between gap-2 border-b border-border-subtle px-3 py-2">
        <h2 className="text-sm font-medium text-text-primary">
          <span className="text-accent">{symbol}</span> Chart
        </h2>

        <div className="flex items-center border border-border-subtle">
          {TIMEFRAMES.map((value) => (
            <Button
              key={value}
              variant={timeframe === value ? 'primary' : 'ghost'}
              className="border-0 border-r border-border-subtle px-2 py- font-mono text-xs last:border-r-0"
              onClick={() => setTimeframe(value)}
            >
              {value}
            </Button>
          ))}
        </div>

        <div className="flex items-center max-h-7 border border-border-subtle">
          <Button
            variant={mode === 'candles' ? 'primary' : 'ghost'}
            className="border-0 border-r border-border-subtle px-2 font-mono text-xs"
            onClick={() => setMode('candles')}
          >
            Candles
          </Button>
          <Button
            variant={mode === 'line' ? 'primary' : 'ghost'}
            className="border-0 px-2 font-mono text-xs"
            onClick={() => setMode('line')}
          >
            Line
          </Button>
        </div>
      </div>

      <div className="p-3 lg:relative lg:flex-1 lg:min-h-0">
        {loading && <Skeleton className="h-[360px] w-full" />}
        {!loading && error && <p className="text-xs text-negative">{error}</p>}
        {!loading && !error && isEmpty && (
          <p className="text-xs text-text-secondary">No chart data available.</p>
        )}
        <div
          ref={containerRef}
          className={
            loading || error || isEmpty ? 'hidden' : 'h-[360px] w-full lg:absolute lg:inset-0 lg:h-auto'
          }
        />
      </div>
    </section>
  );
}

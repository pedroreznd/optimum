import { useEffect, useMemo, useRef } from 'react';
import {
  createChart,
  HistogramSeries,
  LineSeries,
  type IChartApi,
  type ISeriesApi,
  type LogicalRange,
  type MouseEventParams,
  type Time
} from 'lightweight-charts';
import { formatCompact } from '@/lib/utils';
import { calculateVolumeSMA } from '@/lib/indicators';
import type { MainChartSyncBridge } from '@/lib/chartSync';
import { theme } from '@/lib/theme';
import type { CandleDataPoint } from '@/types/finnhub';

interface VolumeChartProps {
  candles: CandleDataPoint[];
  mainSyncBridge: MainChartSyncBridge | null;
}

export default function VolumeChart({ candles, mainSyncBridge }: VolumeChartProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const smaRef = useRef<ISeriesApi<'Line'> | null>(null);
  const histogramRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const syncStateRef = useRef<{ range: boolean; crosshair: boolean }>({ range: false, crosshair: false });

  const sma = useMemo(() => calculateVolumeSMA(candles, 20), [candles]);
  const valueMap = useMemo(() => {
    const map = new Map<number, number>();
    candles.forEach((candle) => map.set(candle.time, candle.volume));
    return map;
  }, [candles]);

  const latestVolume = candles.length > 0 ? candles[candles.length - 1]?.volume ?? null : null;
  const latestAverage = sma.length > 0 ? sma[sma.length - 1]?.value ?? null : null;

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      autoSize: true,
      height: 200,
      layout: { background: { color: theme.background.surface }, textColor: theme.text.secondary },
      grid: { vertLines: { color: theme.border.subtle }, horzLines: { color: theme.border.subtle } },
      rightPriceScale: { borderColor: theme.border.subtle },
      timeScale: { borderColor: theme.border.subtle, visible: false },
      crosshair: { mode: 1 },
      handleScroll: false,
      handleScale: false
    });

    const histogram = chart.addSeries(HistogramSeries, {
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => formatCompact(price)
      },
      priceLineVisible: false,
      lastValueVisible: false
    });

    const smaLine = chart.addSeries(LineSeries, {
      color: theme.accent.DEFAULT,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false
    });

    chartRef.current = chart;
    histogramRef.current = histogram;
    smaRef.current = smaLine;

    return () => {
      chart.remove();
      chartRef.current = null;
      histogramRef.current = null;
      smaRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!histogramRef.current || !smaRef.current || !chartRef.current) return;

    histogramRef.current.setData(
      candles.map((candle) => ({
        time: candle.time as never,
        value: candle.volume,
        color: candle.close >= candle.open ? theme.positive : theme.negative
      }))
    );

    smaRef.current.setData(
      sma.map((point) => ({
        time: point.time as never,
        value: point.value
      }))
    );

    chartRef.current.timeScale().fitContent();
  }, [candles, sma]);

  useEffect(() => {
    if (!mainSyncBridge || !chartRef.current || !histogramRef.current) return;

    const indicatorChart = chartRef.current;
    const indicatorSeries = histogramRef.current;

    const indicatorCrosshair = (param: MouseEventParams<Time>): void => {
      const time = param.time;
      const mainSeries = mainSyncBridge.getSeries();
      if (!mainSeries) return;
      if (syncStateRef.current.crosshair) return;

      if (!time || typeof time !== 'number') {
        return;
      }

      const mainValue = mainSyncBridge.getValueAtTime(time);
      if (mainValue === null) return;

      syncStateRef.current.crosshair = true;
      mainSyncBridge.chart.setCrosshairPosition(mainValue, time as Time, mainSeries);
      syncStateRef.current.crosshair = false;
    };

    const mainCrosshair = (param: MouseEventParams<Time>): void => {
      const time = param.time;
      if (syncStateRef.current.crosshair) return;
      if (!time || typeof time !== 'number') {
        return;
      }

      const value = valueMap.get(time);
      if (value === undefined) return;

      syncStateRef.current.crosshair = true;
      indicatorChart.setCrosshairPosition(value, time as Time, indicatorSeries);
      syncStateRef.current.crosshair = false;
    };

    const syncFromMain = (range: LogicalRange | null): void => {
      if (!range) return;
      if (syncStateRef.current.range) return;
      syncStateRef.current.range = true;
          indicatorChart.timeScale().setVisibleLogicalRange(range);
      syncStateRef.current.range = false;
    };

    const syncToMain = (range: LogicalRange | null): void => {
      if (!range) return;
      if (syncStateRef.current.range) return;
      syncStateRef.current.range = true;
      mainSyncBridge.chart.timeScale().setVisibleLogicalRange(range);
      syncStateRef.current.range = false;
    };

    mainSyncBridge.chart.subscribeCrosshairMove(mainCrosshair);
    indicatorChart.subscribeCrosshairMove(indicatorCrosshair);
    mainSyncBridge.chart.timeScale().subscribeVisibleLogicalRangeChange(syncFromMain);
    indicatorChart.timeScale().subscribeVisibleLogicalRangeChange(syncToMain);

    return () => {
      mainSyncBridge.chart.unsubscribeCrosshairMove(mainCrosshair);
      indicatorChart.unsubscribeCrosshairMove(indicatorCrosshair);
      mainSyncBridge.chart.timeScale().unsubscribeVisibleLogicalRangeChange(syncFromMain);
      indicatorChart.timeScale().unsubscribeVisibleLogicalRangeChange(syncToMain);
    };
  }, [mainSyncBridge, valueMap]);

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-3 top-2 z-10">
        <p className="text-xs uppercase tracking-widest text-text-secondary">Volume</p>
        <p className="font-mono text-sm text-text-primary">
          Vol {latestVolume === null ? '--' : formatCompact(latestVolume)} | Avg {latestAverage === null ? '--' : formatCompact(latestAverage)}
        </p>
      </div>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

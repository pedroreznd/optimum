import { useEffect, useMemo, useRef } from 'react';
import {
  createChart,
  LineSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type LogicalRange,
  type MouseEventParams,
  type Time
} from 'lightweight-charts';
import { calculateRSI } from '@/lib/indicators';
import type { MainChartSyncBridge } from '@/lib/chartSync';
import { theme } from '@/lib/theme';
import type { CandleDataPoint } from '@/types/finnhub';

interface RSIChartProps {
  candles: CandleDataPoint[];
  mainSyncBridge: MainChartSyncBridge | null;
}

export default function RSIChart({ candles, mainSyncBridge }: RSIChartProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const lineRef = useRef<ISeriesApi<'Line'> | null>(null);
  const syncStateRef = useRef<{ range: boolean; crosshair: boolean }>({ range: false, crosshair: false });

  const rsiData = useMemo(() => calculateRSI(candles, 14), [candles]);
  const valueMap = useMemo(() => {
    const map = new Map<number, number>();
    rsiData.forEach((point) => map.set(point.time, point.value));
    return map;
  }, [rsiData]);

  const latest = rsiData.length > 0 ? rsiData[rsiData.length - 1]?.value ?? null : null;

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

    const line = chart.addSeries(LineSeries, {
      color: theme.accent.DEFAULT,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      autoscaleInfoProvider: () => ({
        priceRange: {
          minValue: 0,
          maxValue: 100
        }
      })
    });

    line.createPriceLine({
      price: 70,
      color: theme.negative,
      lineStyle: LineStyle.Dashed,
      lineWidth: 1,
      axisLabelVisible: false,
      title: '70'
    });

    line.createPriceLine({
      price: 30,
      color: theme.positive,
      lineStyle: LineStyle.Dashed,
      lineWidth: 1,
      axisLabelVisible: false,
      title: '30'
    });

    chartRef.current = chart;
    lineRef.current = line;

    return () => {
      chart.remove();
      chartRef.current = null;
      lineRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!lineRef.current) return;

    lineRef.current.setData(
      rsiData.map((point) => ({
        time: point.time as never,
        value: point.value
      }))
    );

    chartRef.current?.timeScale().fitContent();
  }, [rsiData]);

  useEffect(() => {
    if (!mainSyncBridge || !chartRef.current || !lineRef.current) return;

    const indicatorChart = chartRef.current;
    const indicatorSeries = lineRef.current;

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

  const valueColor = latest === null ? 'text-text-secondary' : latest > 70 ? 'text-negative' : latest < 30 ? 'text-positive' : 'text-text-primary';

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-3 top-2 z-10">
        <p className="text-xs uppercase tracking-widest text-text-secondary">RSI</p>
        <p className={`font-mono text-sm ${valueColor}`}>{latest === null ? '--' : latest.toFixed(2)}</p>
      </div>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

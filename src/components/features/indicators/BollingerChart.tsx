import { useEffect, useMemo, useRef } from 'react';
import {
  createChart,
  AreaSeries,
  LineSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type LogicalRange,
  type MouseEventParams,
  type Time
} from 'lightweight-charts';
import { calculateBollingerBands } from '@/lib/indicators';
import type { MainChartSyncBridge } from '@/lib/chartSync';
import { theme } from '@/lib/theme';
import type { CandleDataPoint } from '@/types/finnhub';

interface BollingerChartProps {
  candles: CandleDataPoint[];
  mainSyncBridge: MainChartSyncBridge | null;
}

export default function BollingerChart({ candles, mainSyncBridge }: BollingerChartProps): JSX.Element {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const fillRef = useRef<ISeriesApi<'Area'> | null>(null);
  const upperRef = useRef<ISeriesApi<'Line'> | null>(null);
  const middleRef = useRef<ISeriesApi<'Line'> | null>(null);
  const lowerRef = useRef<ISeriesApi<'Line'> | null>(null);
  const syncStateRef = useRef<{ range: boolean; crosshair: boolean }>({ range: false, crosshair: false });

  const bands = useMemo(() => calculateBollingerBands(candles, 20, 2), [candles]);
  const valueMap = useMemo(() => {
    const map = new Map<number, number>();
    bands.forEach((point) => map.set(point.time, point.middle));
    return map;
  }, [bands]);

  const latest = bands.length > 0 ? bands[bands.length - 1] ?? null : null;
  const hasSufficientData = bands.length > 0;

  useEffect(() => {
    if (!hasSufficientData) return;
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

    const fillArea = chart.addSeries(AreaSeries, {
      topColor: 'rgba(37, 99, 235, 0.04)',
      bottomColor: 'rgba(37, 99, 235, 0.04)',
      lineColor: 'transparent',
      priceLineVisible: false,
      lastValueVisible: false
    });

    const upper = chart.addSeries(LineSeries, {
      color: theme.negative,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      priceLineVisible: false,
      lastValueVisible: false
    });

    const middle = chart.addSeries(LineSeries, {
      color: theme.text.secondary,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      priceLineVisible: false,
      lastValueVisible: false
    });

    const lower = chart.addSeries(LineSeries, {
      color: theme.positive,
      lineWidth: 1,
      lineStyle: LineStyle.Dashed,
      priceLineVisible: false,
      lastValueVisible: false
    });

    chartRef.current = chart;
    fillRef.current = fillArea;
    upperRef.current = upper;
    middleRef.current = middle;
    lowerRef.current = lower;

    return () => {
      chart.remove();
      chartRef.current = null;
      fillRef.current = null;
      upperRef.current = null;
      middleRef.current = null;
      lowerRef.current = null;
    };
  }, [hasSufficientData]);

  useEffect(() => {
    if (!chartRef.current || !fillRef.current || !upperRef.current || !middleRef.current || !lowerRef.current) return;

    const fillData = bands.map((point) => ({
      time: point.time as never,
      value: point.upper
    }));

    const upperData = bands.map((point) => ({
      time: point.time as never,
      value: point.upper
    }));

    const middleData = bands.map((point) => ({
      time: point.time as never,
      value: point.middle
    }));

    const lowerData = bands.map((point) => ({
      time: point.time as never,
      value: point.lower
    }));

    fillRef.current.setData(fillData);
    upperRef.current.setData(upperData);
    middleRef.current.setData(middleData);
    lowerRef.current.setData(lowerData);

    chartRef.current.timeScale().fitContent();
  }, [bands]);

  useEffect(() => {
    if (!mainSyncBridge || !chartRef.current || !middleRef.current) return;

    const indicatorChart = chartRef.current;
    const indicatorSeries = middleRef.current;

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

  if (!hasSufficientData) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <p className="text-xs text-text-secondary">Insufficient data</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-3 top-2 z-10">
        <p className="text-xs uppercase tracking-widest text-text-secondary">BB(20,2)</p>
        <p className="font-mono text-sm text-text-primary">
          <span className="text-negative">{latest ? latest.upper.toFixed(2) : '--'}</span>
          <span className="text-text-muted"> · </span>
          <span className="text-text-secondary">{latest ? latest.middle.toFixed(2) : '--'}</span>
          <span className="text-text-muted"> · </span>
          <span className="text-positive">{latest ? latest.lower.toFixed(2) : '--'}</span>
        </p>
      </div>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}

import type { IChartApi, ISeriesApi } from 'lightweight-charts';

export interface MainChartSyncBridge {
  chart: IChartApi;
  getSeries: () => ISeriesApi<'Line' | 'Candlestick'> | null;
  getValueAtTime: (time: number) => number | null;
}

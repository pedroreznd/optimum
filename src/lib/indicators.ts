import type { CandleDataPoint } from '@/types/finnhub';

export interface IndicatorLinePoint {
  time: number;
  value: number;
}

export interface MacdPoint {
  time: number;
  macd: number;
  signal: number | null;
  histogram: number | null;
}

export interface BollingerPoint {
  time: number;
  upper: number;
  middle: number;
  lower: number;
}

const toCloseArray = (candles: CandleDataPoint[]): number[] => candles.map((candle) => candle.close);

const calculateEMA = (values: number[], period: number): Array<number | null> => {
  const output: Array<number | null> = Array.from({ length: values.length }, () => null);
  if (values.length < period) return output;

  const initial = values.slice(0, period).reduce((sum, value) => sum + value, 0) / period;
  output[period - 1] = initial;

  const k = 2 / (period + 1);
  for (let i = period; i < values.length; i += 1) {
    const prev = output[i - 1];
    const current = values[i];
    if (prev == null || current === undefined) continue;
    output[i] = current * k + prev * (1 - k);
  }

  return output;
};

/**
 * Computes RSI points from candle closes using Wilder smoothing over `period`.
 * @param candles Ordered candle series with close prices.
 * @param period Lookback window used for average gain/loss smoothing.
 * @returns Time-aligned RSI points (0-100) starting at the first complete window.
 */
export const calculateRSI = (candles: CandleDataPoint[], period = 14): IndicatorLinePoint[] => {
  if (candles.length <= period) return [];

  const closes = toCloseArray(candles);
  const points: IndicatorLinePoint[] = [];

  let gainSum = 0;
  let lossSum = 0;

  for (let i = 1; i <= period; i += 1) {
    const current = closes[i];
    const previous = closes[i - 1];
    if (current === undefined || previous === undefined) continue;
    const change = current - previous;
    if (change >= 0) gainSum += change;
    else lossSum += Math.abs(change);
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;

  const firstRs = avgLoss === 0 ? Number.POSITIVE_INFINITY : avgGain / avgLoss;
  const firstRsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + firstRs);
  const firstCandle = candles[period];
  if (!firstCandle) return points;
  points.push({ time: firstCandle.time, value: Number(firstRsi.toFixed(2)) });

  for (let i = period + 1; i < closes.length; i += 1) {
    const current = closes[i];
    const previous = closes[i - 1];
    if (current === undefined || previous === undefined) continue;
    const change = current - previous;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const rs = avgLoss === 0 ? Number.POSITIVE_INFINITY : avgGain / avgLoss;
    const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);

    const candle = candles[i];
    if (!candle) continue;
    points.push({ time: candle.time, value: Number(rsi.toFixed(2)) });
  }

  return points;
};

export const calculateMACD = (
  candles: CandleDataPoint[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MacdPoint[] => {
  if (candles.length < slowPeriod) return [];

  const closes = toCloseArray(candles);
  const fastEma = calculateEMA(closes, fastPeriod);
  const slowEma = calculateEMA(closes, slowPeriod);

  const macdRaw: Array<number | null> = closes.map((_, index) => {
    const fast = fastEma[index];
    const slow = slowEma[index];
    if (fast == null || slow == null) return null;
    return fast - slow;
  });

  const macdValues = macdRaw.filter((value): value is number => value !== null);
  const signalDense = calculateEMA(macdValues, signalPeriod);

  const signalRaw: Array<number | null> = Array.from({ length: macdRaw.length }, () => null);
  let denseIndex = 0;
  for (let i = 0; i < macdRaw.length; i += 1) {
    if (macdRaw[i] === null) continue;
    signalRaw[i] = signalDense[denseIndex] ?? null;
    denseIndex += 1;
  }

  const result: MacdPoint[] = [];
  for (let i = 0; i < candles.length; i += 1) {
    const macd = macdRaw[i];
    if (macd == null) continue;
    const signal = signalRaw[i];
    const histogram = signal == null ? null : macd - signal;
    const candle = candles[i];
    if (!candle) continue;

    result.push({
      time: candle.time,
      macd: Number(macd.toFixed(4)),
      signal: signal == null ? null : Number(signal.toFixed(4)),
      histogram: histogram === null ? null : Number(histogram.toFixed(4))
    });
  }

  return result;
};

/**
 * Computes Bollinger Bands from rolling close-price windows.
 * @param candles Ordered candle series with close prices.
 * @param period Window size for the rolling mean and standard deviation.
 * @param stdDevMultiplier Standard deviation multiplier used for upper/lower bands.
 * @returns Time-aligned upper/middle/lower band points for each complete window.
 */
export const calculateBollingerBands = (
  candles: CandleDataPoint[],
  period = 20,
  stdDevMultiplier = 2
): BollingerPoint[] => {
  if (candles.length < period) return [];

  const result: BollingerPoint[] = [];

  for (let i = period - 1; i < candles.length; i += 1) {
    const window = candles.slice(i - period + 1, i + 1);
    const closes = window.map((candle) => candle.close);
    const mean = closes.reduce((sum, value) => sum + value, 0) / period;
    const variance = closes.reduce((sum, value) => sum + (value - mean) ** 2, 0) / period;
    const stdDev = Math.sqrt(variance);
    const upper = mean + stdDevMultiplier * stdDev;
    const lower = mean - stdDevMultiplier * stdDev;
    const candle = candles[i];
    if (!candle) continue;

    result.push({
      time: candle.time,
      upper: Number(upper.toFixed(4)),
      middle: Number(mean.toFixed(4)),
      lower: Number(lower.toFixed(4))
    });
  }

  return result;
};

/**
 * Computes a simple moving average of candle volume with a rolling sum window.
 * @param candles Ordered candle series with volume values.
 * @param period Window size used for the volume SMA.
 * @returns Time-aligned volume SMA points for each complete window.
 */
export const calculateVolumeSMA = (candles: CandleDataPoint[], period = 20): IndicatorLinePoint[] => {
  if (candles.length < period) return [];

  const result: IndicatorLinePoint[] = [];
  let rollingSum = 0;

  for (let i = 0; i < candles.length; i += 1) {
    const candle = candles[i];
    if (!candle) continue;
    rollingSum += candle.volume;

    if (i >= period) {
      const dropCandle = candles[i - period];
      if (dropCandle) rollingSum -= dropCandle.volume;
    }

    if (i >= period - 1) {
      const pointCandle = candles[i];
      if (!pointCandle) continue;
      result.push({
        time: pointCandle.time,
        value: Number((rollingSum / period).toFixed(2))
      });
    }
  }

  return result;
};

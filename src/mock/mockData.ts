import type {
  FinnhubCandles,
  FinnhubQuote,
  FinnhubSearchResponse,
  FinnhubWsTrade,
  StockListItem,
  Timeframe
} from '@/types/finnhub';

export const POPULAR_SYMBOLS: (StockListItem & { change: number })[] = [
  { symbol: 'AAPL', name: 'Apple Inc', change: 0.54 },
  { symbol: 'MSFT', name: 'Microsoft Corp', change: -0.42 },
  { symbol: 'NVDA', name: 'NVIDIA Corp', change: 0.94 },
  { symbol: 'AMZN', name: 'Amazon.com Inc', change: -0.2 },
  { symbol: 'GOOGL', name: 'Alphabet Inc', change: 0.36 },
  { symbol: 'META', name: 'Meta Platforms Inc', change: 0.63 },
  { symbol: 'TSLA', name: 'Tesla Inc', change: -1.44 },
  { symbol: 'ORCL', name: 'Oracle Corp', change: 0.59 },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co', change: -0.23 },
  { symbol: 'BAC', name: 'Bank of America Corp', change: 0.31 },
  { symbol: 'GS', name: 'Goldman Sachs Group Inc', change: -0.5 },
  { symbol: 'WFC', name: 'Wells Fargo & Co', change: -0.31 },
  { symbol: 'XOM', name: 'Exxon Mobil Corp', change: 0.38 },
  { symbol: 'CVX', name: 'Chevron Corp', change: -0.4 },
  { symbol: 'COP', name: 'ConocoPhillips', change: 0.82 },
  { symbol: 'PFE', name: 'Pfizer Inc', change: -0.3 },
  { symbol: 'JNJ', name: 'Johnson & Johnson', change: 0.26 },
  { symbol: 'MRK', name: 'Merck & Co Inc', change: -0.41 },
  { symbol: 'UNH', name: 'UnitedHealth Group Inc', change: 0.36 },
  { symbol: 'ABBV', name: 'AbbVie Inc', change: 0.33 },
  { symbol: 'KO', name: 'Coca-Cola Co', change: 0.18 },
  { symbol: 'WMT', name: 'Walmart Inc', change: 0.4 }
];

export const SEARCH_RESULTS: FinnhubSearchResponse = {
  count: POPULAR_SYMBOLS.length,
  result: POPULAR_SYMBOLS.map((item) => ({
    description: item.name,
    displaySymbol: item.symbol,
    symbol: item.symbol,
    type: 'Common Stock'
  }))
};

const quoteSeed: Record<string, FinnhubQuote> = {
  AAPL: { c: 224.39, d: 1.21, dp: 0.54, h: 225.15, l: 221.76, o: 223.1, pc: 223.18, t: 1740733200, v: 61233422, marketCap: 3_380_000_000_000 },
  MSFT: { c: 418.61, d: -1.75, dp: -0.42, h: 421.31, l: 416.22, o: 420.03, pc: 420.36, t: 1740733200, v: 24139210, marketCap: 3_120_000_000_000 },
  NVDA: { c: 879.43, d: 8.19, dp: 0.94, h: 884.5, l: 866.4, o: 870.11, pc: 871.24, t: 1740733200, v: 40129221, marketCap: 2_170_000_000_000 },
  AMZN: { c: 178.8, d: -0.36, dp: -0.2, h: 180.22, l: 177.31, o: 179.1, pc: 179.16, t: 1740733200, v: 39109281, marketCap: 1_860_000_000_000 },
  GOOGL: { c: 172.55, d: 0.62, dp: 0.36, h: 173.17, l: 170.62, o: 171.1, pc: 171.93, t: 1740733200, v: 30092210, marketCap: 2_140_000_000_000 },
  META: { c: 512.17, d: 3.24, dp: 0.63, h: 514.1, l: 507.33, o: 510.02, pc: 508.93, t: 1740733200, v: 17422100, marketCap: 1_300_000_000_000 },
  TSLA: { c: 192.44, d: -2.81, dp: -1.44, h: 196.01, l: 191.84, o: 195.02, pc: 195.25, t: 1740733200, v: 92318110, marketCap: 610_000_000_000 },
  ORCL: { c: 132.38, d: 0.78, dp: 0.59, h: 133.5, l: 130.9, o: 131.4, pc: 131.6, t: 1740733200, v: 7801120, marketCap: 360_000_000_000 },
  JPM: { c: 194.07, d: -0.44, dp: -0.23, h: 195.5, l: 192.7, o: 194.8, pc: 194.51, t: 1740733200, v: 10220010, marketCap: 560_000_000_000 },
  BAC: { c: 39.28, d: 0.12, dp: 0.31, h: 39.55, l: 38.9, o: 39.11, pc: 39.16, t: 1740733200, v: 30500220, marketCap: 310_000_000_000 },
  GS: { c: 407.77, d: -2.03, dp: -0.5, h: 411.2, l: 405.4, o: 409.2, pc: 409.8, t: 1740733200, v: 2412100, marketCap: 130_000_000_000 },
  WFC: { c: 58.22, d: -0.18, dp: -0.31, h: 58.8, l: 57.9, o: 58.5, pc: 58.4, t: 1740733200, v: 18422190, marketCap: 215_000_000_000 },
  XOM: { c: 113.8, d: 0.43, dp: 0.38, h: 114.6, l: 112.5, o: 113.1, pc: 113.37, t: 1740733200, v: 12550110, marketCap: 455_000_000_000 },
  CVX: { c: 152.44, d: -0.62, dp: -0.4, h: 153.9, l: 151.7, o: 153.4, pc: 153.06, t: 1740733200, v: 7311020, marketCap: 280_000_000_000 },
  COP: { c: 112.16, d: 0.91, dp: 0.82, h: 112.9, l: 110.8, o: 111.2, pc: 111.25, t: 1740733200, v: 5921180, marketCap: 145_000_000_000 },
  PFE: { c: 29.44, d: -0.09, dp: -0.3, h: 29.8, l: 29.2, o: 29.6, pc: 29.53, t: 1740733200, v: 21113300, marketCap: 165_000_000_000 },
  JNJ: { c: 158.61, d: 0.41, dp: 0.26, h: 159.2, l: 157.8, o: 158.1, pc: 158.2, t: 1740733200, v: 6122210, marketCap: 382_000_000_000 },
  MRK: { c: 126.4, d: -0.52, dp: -0.41, h: 127.8, l: 125.9, o: 127.2, pc: 126.92, t: 1740733200, v: 5349000, marketCap: 320_000_000_000 },
  UNH: { c: 488.29, d: 1.74, dp: 0.36, h: 490.5, l: 484.7, o: 486.4, pc: 486.55, t: 1740733200, v: 3221100, marketCap: 450_000_000_000 },
  ABBV: { c: 178.04, d: 0.58, dp: 0.33, h: 178.9, l: 176.6, o: 177.2, pc: 177.46, t: 1740733200, v: 4124110, marketCap: 315_000_000_000 },
  KO: { c: 62.77, d: 0.11, dp: 0.18, h: 63.1, l: 62.4, o: 62.6, pc: 62.66, t: 1740733200, v: 10110210, marketCap: 272_000_000_000 },
  WMT: { c: 65.21, d: 0.26, dp: 0.4, h: 65.8, l: 64.7, o: 64.9, pc: 64.95, t: 1740733200, v: 11840210, marketCap: 525_000_000_000 }
};

export const getMockQuote = (symbol: string): FinnhubQuote => {
  const base = quoteSeed[symbol] ?? {
    c: 100,
    d: 0,
    dp: 0,
    h: 101,
    l: 98,
    o: 99,
    pc: 100,
    t: 1740733200,
    v: 1_000_000,
    marketCap: 10_000_000_000
  };

  return {
    ...base,
    c: Number((base.c + (Math.random() * 2 - 1)).toFixed(2)),
    d: Number((base.d + (Math.random() - 0.5) * 0.8).toFixed(2)),
    dp: Number((base.dp + (Math.random() - 0.5) * 0.3).toFixed(2)),
    t: Math.floor(Date.now() / 1000)
  };
};

export const getMockCandles = (symbol: string, timeframe: Timeframe): FinnhubCandles => {
  const intervalByTimeframe: Record<Timeframe, number> = {
    '1D': 60,
    '1W': 5 * 60,
    '1M': 60 * 60,
    '3M': 24 * 60 * 60,
  };

  const countByTimeframe: Record<Timeframe, number> = {
    '1D': 390,
    '1W': 390,
    '1M': 720,
    '3M': 90,
  };

  const count = countByTimeframe[timeframe];
  const interval = intervalByTimeframe[timeframe];
  const now = Math.floor(Date.now() / 1000);
  const basePrice = (quoteSeed[symbol]?.c ?? 100) - 5;

  const c: number[] = [];
  const h: number[] = [];
  const l: number[] = [];
  const o: number[] = [];
  const t: number[] = [];
  const v: number[] = [];

  let current = basePrice;

  for (let i = count; i > 0; i -= 1) {
    const timestamp = now - i * interval;
    const open = current;
    const volatility = basePrice * 0.002;
    const drift = (Math.random() - 0.48) * volatility;
    const close = Math.max(basePrice * 0.01, open + drift);
    const wick = volatility * 0.5;
    const high = Math.max(open, close) + Math.random() * wick;
    const low = Math.max(basePrice * 0.01, Math.min(open, close) - Math.random() * wick);

    o.push(Number(open.toFixed(2)));
    c.push(Number(close.toFixed(2)));
    h.push(Number(high.toFixed(2)));
    l.push(Number(low.toFixed(2)));
    t.push(timestamp);
    v.push(Math.floor(100_000 + Math.random() * 4_000_000));
    current = close;
  }

  return { c, h, l, o, t, v, s: 'ok' };
};

export const getMockWsTrade = (symbol: string): FinnhubWsTrade => {
  const quote = getMockQuote(symbol);
  return {
    p: quote.c,
    s: symbol,
    t: Date.now(),
    v: Math.floor(100 + Math.random() * 10_000)
  };
};

export const getApproximatePriceForSymbol = (symbol: string): number => quoteSeed[symbol]?.c ?? 100;

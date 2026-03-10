import type { FinnhubCandles, FinnhubQuote, FinnhubSearchResponse, FinnhubWsTrade, Timeframe } from '@/types/finnhub';

interface CryptoCoin {
  symbol: string;
  name: string;
  price: number;
  change: number;
}

// Top coins list for the crypto browser
export const CRYPTO_COINS: CryptoCoin[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 67420.5, change: 1.24 },
  { symbol: 'ETH', name: 'Ethereum', price: 3518.9, change: -0.87 },
  { symbol: 'BNB', name: 'BNB', price: 608.3, change: 0.45 },
  { symbol: 'SOL', name: 'Solana', price: 172.4, change: 3.12 },
  { symbol: 'XRP', name: 'XRP', price: 0.5921, change: -1.03 },
  { symbol: 'ADA', name: 'Cardano', price: 0.4812, change: 0.78 },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.1634, change: 2.55 },
  { symbol: 'AVAX', name: 'Avalanche', price: 38.72, change: -0.34 },
  { symbol: 'DOT', name: 'Polkadot', price: 7.83, change: 1.09 },
  { symbol: 'MATIC', name: 'Polygon', price: 0.7201, change: -0.62 },
  { symbol: 'LINK', name: 'Chainlink', price: 14.82, change: 1.43 },
  { symbol: 'UNI', name: 'Uniswap', price: 8.91, change: -0.76 },
  { symbol: 'LTC', name: 'Litecoin', price: 94.30, change: 0.58 },
  { symbol: 'ATOM', name: 'Cosmos', price: 9.14, change: -1.12 },
  { symbol: 'XLM', name: 'Stellar', price: 0.1183, change: 2.01 },
];

export const CRYPTO_SEARCH_RESULTS: FinnhubSearchResponse = {
  count: CRYPTO_COINS.length,
  result: CRYPTO_COINS.map((coin) => ({
    description: coin.name,
    displaySymbol: coin.symbol,
    symbol: coin.symbol,
    type: 'Cryptocurrency',
  })),
};

const quoteSeed: Record<string, FinnhubQuote> = {
  BTC: {
    c: 67420.5,
    d: 824.64,
    dp: 1.24,
    h: 68120.0,
    l: 66285.32,
    o: 66595.86,
    pc: 66595.86,
    t: 1740733200,
    v: 310_421,
    marketCap: 1_330_000_000_000,
  },
  ETH: {
    c: 3518.9,
    d: -30.89,
    dp: -0.87,
    h: 3575.42,
    l: 3469.1,
    o: 3549.79,
    pc: 3549.79,
    t: 1740733200,
    v: 6_420_390,
    marketCap: 422_000_000_000,
  },
  BNB: {
    c: 608.3,
    d: 2.73,
    dp: 0.45,
    h: 616.2,
    l: 601.7,
    o: 605.57,
    pc: 605.57,
    t: 1740733200,
    v: 1_241_901,
    marketCap: 91_000_000_000,
  },
  SOL: {
    c: 172.4,
    d: 5.22,
    dp: 3.12,
    h: 176.91,
    l: 166.02,
    o: 167.18,
    pc: 167.18,
    t: 1740733200,
    v: 14_824_100,
    marketCap: 76_000_000_000,
  },
  XRP: {
    c: 0.5921,
    d: -0.0062,
    dp: -1.03,
    h: 0.6039,
    l: 0.5862,
    o: 0.5983,
    pc: 0.5983,
    t: 1740733200,
    v: 45_321_000,
    marketCap: 33_000_000_000,
  },
  ADA: {
    c: 0.4812,
    d: 0.0037,
    dp: 0.78,
    h: 0.4898,
    l: 0.4721,
    o: 0.4775,
    pc: 0.4775,
    t: 1740733200,
    v: 38_221_500,
    marketCap: 17_000_000_000,
  },
  DOGE: {
    c: 0.1634,
    d: 0.0041,
    dp: 2.55,
    h: 0.1679,
    l: 0.1578,
    o: 0.1593,
    pc: 0.1593,
    t: 1740733200,
    v: 128_341_000,
    marketCap: 23_000_000_000,
  },
  AVAX: {
    c: 38.72,
    d: -0.13,
    dp: -0.34,
    h: 39.48,
    l: 38.02,
    o: 38.85,
    pc: 38.85,
    t: 1740733200,
    v: 5_092_140,
    marketCap: 14_000_000_000,
  },
  DOT: {
    c: 7.83,
    d: 0.08,
    dp: 1.09,
    h: 8.02,
    l: 7.68,
    o: 7.75,
    pc: 7.75,
    t: 1740733200,
    v: 9_231_003,
    marketCap: 11_000_000_000,
  },
  MATIC: {
    c: 0.7201,
    d: -0.0045,
    dp: -0.62,
    h: 0.7362,
    l: 0.7094,
    o: 0.7246,
    pc: 0.7246,
    t: 1740733200,
    v: 21_008_331,
    marketCap: 7_000_000_000,
  },
};

export const getCryptoMockQuote = (symbol: string): FinnhubQuote => {
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
    marketCap: 10_000_000_000,
  };

  return {
    ...base,
    c: Number((base.c + (Math.random() * 2 - 1) * Math.max(base.c * 0.004, 0.01)).toFixed(4)),
    d: Number((base.d + (Math.random() - 0.5) * Math.max(base.c * 0.002, 0.001)).toFixed(4)),
    dp: Number((base.dp + (Math.random() - 0.5) * 0.5).toFixed(2)),
    t: Math.floor(Date.now() / 1000),
  };
};

export const getCryptoMockCandles = (symbol: string, timeframe: Timeframe): FinnhubCandles => {
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
  const basePrice = (quoteSeed[symbol]?.c ?? 100) * 0.98;

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
    const volatility = Math.max(basePrice * 0.002, 0.0001);
    const drift = (Math.random() - 0.48) * volatility;
    const close = Math.max(basePrice * 0.01, open + drift);
    const wick = volatility * 0.5;
    const high = Math.max(open, close) + Math.random() * wick;
    const low = Math.max(basePrice * 0.01, Math.min(open, close) - Math.random() * wick);

    o.push(Number(open.toFixed(4)));
    c.push(Number(close.toFixed(4)));
    h.push(Number(high.toFixed(4)));
    l.push(Number(low.toFixed(4)));
    t.push(timestamp);
    v.push(Math.floor(50_000 + Math.random() * 2_000_000));
    current = close;
  }

  return { c, h, l, o, t, v, s: 'ok' };
};

export const getCryptoMockWsTrade = (symbol: string): FinnhubWsTrade => {
  const quote = getCryptoMockQuote(symbol);
  return {
    p: quote.c,
    s: symbol,
    t: Date.now(),
    v: Math.floor(100 + Math.random() * 10_000),
  };
};

export const CRYPTO_RECENT_TRADES: Record<string, FinnhubWsTrade[]> = Object.fromEntries(
  CRYPTO_COINS.map((coin) => [
    coin.symbol,
    Array.from({ length: 12 }, (_, index) => {
      const trade = getCryptoMockWsTrade(coin.symbol);
      return {
        ...trade,
        t: trade.t - index * 20_000,
      };
    }),
  ]),
) as Record<string, FinnhubWsTrade[]>;

export const getCryptoApproximatePriceForSymbol = (symbol: string): number =>
  quoteSeed[symbol]?.c ?? 100;

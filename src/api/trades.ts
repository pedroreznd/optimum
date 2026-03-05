import { getApproximatePriceForSymbol } from '@/api/mockData';

interface FinnhubTradesResponse {
  data: Array<{
    p: number;
    s: string;
    t: number;
    v: number;
    c: string[];
  }>;
  symbol: string;
}

export interface TradeItem {
  id: string;
  price: number;
  volume: number;
  timestamp: number;
  conditions: string[];
}

const FINNHUB_API_BASE_URL = import.meta.env.VITE_FINNHUB_API_BASE_URL;

const toTradeItems = (raw: FinnhubTradesResponse['data']): TradeItem[] =>
  raw.map((trade, index) => ({
    id: String(index),
    price: trade.p,
    volume: trade.v,
    timestamp: trade.t,
    conditions: trade.c,
  }));

const generateMockTrades = (symbol: string): TradeItem[] => {
  const basePrice = getApproximatePriceForSymbol(symbol);
  const trades: TradeItem[] = [];

  let cursor = Date.now();

  for (let index = 0; index < 30; index += 1) {
    const offset = 3000 + Math.floor(Math.random() * 12000);
    cursor -= offset;

    const priceJitter = (Math.random() - 0.5) * 0.01;
    const price = Number((basePrice * (1 + priceJitter)).toFixed(2));
    const volume = 100 + Math.floor(Math.random() * 4901);

    trades.push({
      id: String(index),
      price,
      volume,
      timestamp: cursor,
      conditions: [],
    });
  }

  return trades.sort((a, b) => b.timestamp - a.timestamp);
};

export const fetchRecentTrades = async (symbol: string): Promise<TradeItem[]> => {
  if (!symbol) return [];
  return generateMockTrades(symbol);
};

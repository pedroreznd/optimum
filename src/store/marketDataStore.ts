import { create } from 'zustand';

interface MarketDataState {
  latestTrades: Record<string, { p: number }>;
  setTrade: (symbol: string, price: number) => void;
}

export const latestTradesCache: Record<string, { p: number }> = {};

export const useMarketDataStore = create<MarketDataState>((set) => ({
  latestTrades: latestTradesCache,
  setTrade: (symbol, price) => {
    latestTradesCache[symbol] = { p: price };
    set(() => ({ latestTrades: { ...latestTradesCache } }));
  },
}));

import { create } from 'zustand';

interface MarketDataState {
  latestTrades: Record<string, { p: number }>;
  setTrade: (symbol: string, price: number) => void;
}

/**
 * Mutable hot-path cache kept outside React component state.
 * WebSocket ticks can arrive many times per second; mutating this object avoids
 * forcing component re-renders for every tick while still exposing latest prices.
 */
export const latestTradesCache: Record<string, { p: number }> = {};

export const useMarketDataStore = create<MarketDataState>((set) => ({
  latestTrades: latestTradesCache,
  /**
   * Updates the mutable trade cache and notifies subscribers.
   * This uses a lightweight set-call notification pattern so high-frequency
   * updates can be consumed imperatively without per-tick React state churn.
   */
  setTrade: (symbol, price) => {
    latestTradesCache[symbol] = { p: price };
    set(() => ({ latestTrades: { ...latestTradesCache } }));
  },
}));

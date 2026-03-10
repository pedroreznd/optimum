import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * Watchlist state with localStorage persistence for cross-session continuity.
 */
interface WatchlistState {
  symbols: string[];
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  clearWatchlist: () => void;
}

export const useCryptoWatchlistStore = create<WatchlistState>()(
  persist(
    (set) => ({
      symbols: ['BTC', 'ETH', 'SOL'],
      addSymbol: (symbol) =>
        set((state) => {
          if (state.symbols.includes(symbol)) return state;
          return { symbols: [...state.symbols, symbol] };
        }),
      removeSymbol: (symbol) =>
        set((state) => ({
          symbols: state.symbols.filter((item) => item !== symbol),
        })),
      clearWatchlist: () => set({ symbols: [] }),
    }),
    {
      name: 'optimum-crypto-watchlist',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

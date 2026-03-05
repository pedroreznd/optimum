import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface WatchlistState {
  symbols: string[];
  addSymbol: (symbol: string) => void;
  removeSymbol: (symbol: string) => void;
  clearWatchlist: () => void;
}

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set) => ({
      symbols: ['AAPL', 'MSFT', 'NVDA'],
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
      name: 'stock-dashboard-watchlist',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

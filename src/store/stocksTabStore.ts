import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export interface StockTab {
  symbol: string;
  label: string;
  companyName: string;
}

/**
 * Tab state for the stock workspace.
 * Persists open tabs and active symbol so sessions restore after reload.
 */
interface TabState {
  tabs: StockTab[];
  activeSymbol: string | null;
  openTab: (stock: StockTab) => boolean;
  closeTab: (symbol: string) => void;
  setActive: (symbol: string) => void;
}

const MAX_TABS = 8;

export const useStocksTabStore = create<TabState>()(
  persist(
    (set, get) => ({
      tabs: [],
      activeSymbol: null,
      /**
       * Opens a tab when not already present and makes it active.
       * Returns `false` when the max tab cap (8) has been reached.
       */
      openTab: (stock) => {
        const state = get();
        const existing = state.tabs.find((tab) => tab.symbol === stock.symbol);

        if (existing) {
          set({ activeSymbol: stock.symbol });
          return true;
        }

        if (state.tabs.length >= MAX_TABS) {
          return false;
        }

        set({
          tabs: [...state.tabs, stock],
          activeSymbol: stock.symbol
        });

        return true;
      },
      closeTab: (symbol) => {
        const state = get();
        const index = state.tabs.findIndex((tab) => tab.symbol === symbol);
        if (index === -1) return;

        const nextTabs = state.tabs.filter((tab) => tab.symbol !== symbol);

        if (state.activeSymbol !== symbol) {
          set({ tabs: nextTabs });
          return;
        }

        const leftTab = state.tabs[index - 1];
        const rightTab = state.tabs[index + 1];

        set({
          tabs: nextTabs,
          activeSymbol: leftTab?.symbol ?? rightTab?.symbol ?? null
        });
      },
      setActive: (symbol) => {
        const exists = get().tabs.some((tab) => tab.symbol === symbol);
        if (!exists) return;
        set({ activeSymbol: symbol });
      }
    }),
    {
      name: 'stock-dashboard-tabs',
      storage: createJSONStorage(() => localStorage)
    }
  )
);

import { useMemo, useState } from 'react';
import { getMockQuote, POPULAR_SYMBOLS } from '@/mock/mockData';
import { useToastStore } from '@/components/ui/Toast';
import { useStocksTabStore } from '@/store/stocksTabStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import { formatCurrency } from '@/lib/utils';

interface StockBrowserProps {
  className?: string;
  onOpenTab?: () => void;
}

export default function StockBrowser({
  className = '',
  onOpenTab,
}: StockBrowserProps): JSX.Element {
  const [query, setQuery] = useState('');
  const { symbols, addSymbol, removeSymbol } = useWatchlistStore();
  const { openTab } = useStocksTabStore();
  const pushToast = useToastStore((state) => state.pushToast);

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return POPULAR_SYMBOLS;

    return POPULAR_SYMBOLS.filter(
      (stock) =>
        stock.symbol.toLowerCase().includes(normalized) ||
        stock.name.toLowerCase().includes(normalized),
    );
  }, [query]);

  const basePrices = useMemo(
    () =>
      POPULAR_SYMBOLS.reduce<Record<string, number>>((acc, stock) => {
        acc[stock.symbol] = getMockQuote(stock.symbol).c;
        return acc;
      }, {}),
    [],
  );

  return (
    <section className={`h-full border-r border-border-subtle overflow-y-hidden ${className}`}>
      <div className="border-b border-border-subtle p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-text-secondary">Markets</p>
          <span className="border border-border-subtle px-1.5 py-0.5 text-[10px] text-text-secondary">
            {POPULAR_SYMBOLS.length}
          </span>
        </div>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full border border-border-subtle bg-background-surface px-2 py-1 rounded-sm text-xs text-text-primary placeholder:text-text-muted outline-none transition-colors duration-200 focus:border-accent"
          placeholder="Filter by symbol or name"
        />
      </div>

      <div className="h-[calc(100%-76px)] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
        <ul className="min-w-64">
          {filtered.map((stock) => {
            const inWatchlist = symbols.includes(stock.symbol);
            const price = basePrices[stock.symbol];

            return (
              <li
                key={stock.symbol}
                className="relative flex items-center border-b border-border-subtle hover:bg-background-overlay"
              >
                <button
                  className="grid flex-1 grid-cols-[1fr_auto] items-center gap-2 px-3 py-2 text-left"
                  onClick={() => {
                    const opened = openTab({
                      symbol: stock.symbol,
                      label: stock.symbol,
                      companyName: stock.name,
                    });
                    if (!opened) {
                      pushToast('Maximum tabs reached. Close a tab to open a new one.');
                      return;
                    }
                    onOpenTab?.();
                  }}
                >
                  <span>
                    <span className="block font-mono text-sm font-medium text-accent">
                      {stock.symbol}
                    </span>
                    <span className="block text-xs text-text-secondary">{stock.name}</span>
                  </span>
                  <span className="font-mono text-sm text-text-primary">
                    {formatCurrency(price ?? 0)}
                  </span>
                </button>

                <button
                  className="relative z-10 px-2 text-text-secondary hover:text-accent"
                  aria-label={
                    inWatchlist
                      ? `Remove ${stock.symbol} from watchlist`
                      : `Add ${stock.symbol} to watchlist`
                  }
                  onClick={() => {
                    if (inWatchlist) {
                      removeSymbol(stock.symbol);
                      pushToast(`${stock.symbol} removed from watchlist`);
                    } else {
                      addSymbol(stock.symbol);
                      pushToast(`${stock.symbol} added to watchlist`);
                    }
                  }}
                >
                  {inWatchlist ? '★' : '☆'}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

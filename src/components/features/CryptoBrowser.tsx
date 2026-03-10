import { useMemo, useState } from 'react';
import { CRYPTO_COINS } from '@/mock/cryptoData';
import { useToastStore } from '@/components/ui/Toast';
import { useCryptoTabStore } from '@/store/cryptoTabStore';
import { useCryptoWatchlistStore } from '@/store/cryptoWatchlistStore';
import { formatCurrency } from '@/lib/utils';

interface CryptoBrowserProps {
  className?: string;
  onOpenTab: (symbol: string) => void;
}

export default function CryptoBrowser({
  className = '',
  onOpenTab,
}: CryptoBrowserProps): JSX.Element {
  const [query, setQuery] = useState('');
  const { symbols, addSymbol, removeSymbol } = useCryptoWatchlistStore();
  const { openTab } = useCryptoTabStore();
  const pushToast = useToastStore((state) => state.pushToast);

  const filtered = useMemo(() => {
    const normalized = query.toLowerCase().trim();
    if (!normalized) return CRYPTO_COINS;

    return CRYPTO_COINS.filter(
      (coin) =>
        coin.symbol.toLowerCase().includes(normalized) ||
        coin.name.toLowerCase().includes(normalized),
    );
  }, [query]);

  return (
    <section className={`h-full border-r border-border-subtle overflow-y-hidden ${className}`}>
      <div className="border-b border-border-subtle p-3">
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs uppercase tracking-widest text-text-secondary">Markets</p>
          <span className="border border-border-subtle px-1.5 py-0.5 text-[10px] text-text-secondary">
            {CRYPTO_COINS.length}
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
          {filtered.map((coin) => {
            const inWatchlist = symbols.includes(coin.symbol);

            return (
              <li
                key={coin.symbol}
                className="relative flex items-center border-b border-border-subtle hover:bg-background-overlay"
              >
                <button
                  className="grid flex-1 grid-cols-[1fr_auto] items-center gap-2 px-3 py-2 text-left"
                  onClick={() => {
                    const opened = openTab({
                      symbol: coin.symbol,
                      label: coin.symbol,
                      companyName: coin.name,
                    });
                    if (!opened) {
                      pushToast('Maximum tabs reached. Close a tab to open a new one.');
                      return;
                    }
                    onOpenTab(coin.symbol);
                  }}
                >
                  <span>
                    <span className="block font-mono text-sm font-medium text-accent">
                      {coin.symbol}
                    </span>
                    <span className="block text-xs text-text-secondary">{coin.name}</span>
                  </span>
                  <span className="font-mono text-sm text-text-primary">
                    {formatCurrency(coin.price)}
                  </span>
                </button>

                <button
                  className="relative z-10 px-2 text-text-secondary hover:text-accent"
                  aria-label={
                    inWatchlist
                      ? `Remove ${coin.symbol} from watchlist`
                      : `Add ${coin.symbol} to watchlist`
                  }
                  onClick={() => {
                    if (inWatchlist) {
                      removeSymbol(coin.symbol);
                      pushToast(`${coin.symbol} removed from watchlist`);
                    } else {
                      addSymbol(coin.symbol);
                      pushToast(`${coin.symbol} added to watchlist`);
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

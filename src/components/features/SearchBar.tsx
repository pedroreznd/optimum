import { useState } from 'react';
import Skeleton from '@/components/ui/Skeleton';
import { useStockSearch } from '@/hooks/useStockSearch';

interface SearchBarProps {
  onSelect: (symbol: string, companyName: string) => void;
}

export default function SearchBar({ onSelect }: SearchBarProps): JSX.Element {
  const { query, setQuery, loading, error, data, isEmpty } = useStockSearch();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="relative border-b border-border-subtle p-3">
      <p className="mb-2 text-xs uppercase tracking-widest text-text-secondary">Search</p>
      <div className="relative">
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          id="stock-search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full border border-border-subtle bg-background-surface py-1 pl-7 pr-3 rounded-sm text-xs text-text-primary placeholder:text-text-muted outline-none transition-colors duration-200 focus:border-accent"
          placeholder="Search symbol or company"
        />
      </div>

      {isOpen && query.trim() && (
        <div className="absolute left-3 right-3 top-[76px] z-20 max-h-64 overflow-y-auto border border-border-subtle bg-background-surface">
          {loading && (
            <div className="space-y-1 p-2">
              <Skeleton className="h-7 w-full" />
              <Skeleton className="h-7 w-full" />
            </div>
          )}

          {error && <p className="px-3 py-2 text-xs text-negative">{error}</p>}

          {isEmpty && <p className="px-3 py-2 text-xs text-text-secondary">No results found.</p>}

          {!loading &&
            !error &&
            data.map((item, index) => (
              <button
                key={item.symbol}
                onClick={() => {
                  onSelect(item.symbol, item.description);
                  setIsOpen(false);
                  setQuery(item.symbol);
                }}
                className={`flex w-full items-center justify-between px-3 py-2 text-left hover:bg-background-overlay ${
                  index < data.length - 1 ? 'border-b border-border-subtle' : ''
                }`}
              >
                <span className="font-mono text-sm font-medium text-accent">{item.symbol}</span>
                <span className="truncate pl-3 text-xs text-text-secondary">{item.description}</span>
              </button>
            ))}
        </div>
      )}
    </section>
  );
}

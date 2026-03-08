import { useTabStore } from '@/store/tabStore';
import { FiX } from 'react-icons/fi';

export default function StockTabs(): JSX.Element {
  const { tabs, activeSymbol, setActive, closeTab } = useTabStore();

  return (
    <section className={`${tabs.length > 0 && 'border-b'} border-border-subtle bg-background-base`}>
      <div className="hide-scrollbar flex overflow-x-auto">
        {tabs.map((tab) => {
          const active = tab.symbol === activeSymbol;

          return (
            <div
              key={tab.symbol}
              onClick={() => setActive(tab.symbol)}
              className={`group flex h-7 min-w-[140px] items-center cursor-pointer border-r border-border-subtle pl-4 pr-2 text-xs font-mono ${
                active
                  ? 'border-t-2 border-t-accent bg-background-surface text-text-primary'
                  : 'text-text-secondary'
              }`}
            >
              <div className="flex-1 text-left">{tab.symbol}</div>
              <button
                className="ml-2 text-xs opacity-0 transition-opacity hover:text-text-primary group-hover:opacity-100"
                onClick={() => closeTab(tab.symbol)}
                aria-label={`Close ${tab.symbol}`}
                title={`Close ${tab.symbol}`}
              >
                <FiX className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}

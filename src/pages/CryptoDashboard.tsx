import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Chart from '@/components/features/Chart';
import CryptoBrowser from '@/components/features/CryptoBrowser';
import IndicatorPanel from '@/components/features/IndicatorPanel';
import MarketDataProvider from '@/components/MarketDataProvider';
import MetricsCard from '@/components/features/MetricsCard';
import SearchBar from '@/components/features/SearchBar';
import TickerTape from '@/components/features/TickerTape';
import Watchlist from '@/components/features/Watchlist';
import DashboardHeader from '@/components/ui/DashboardHeader';
import Drawer from '@/components/ui/Drawer';
import Skeleton from '@/components/ui/Skeleton';
import Toast, { useToastStore } from '@/components/ui/Toast';
import { CRYPTO_COINS, getCryptoMockQuote } from '@/mock/cryptoData';
import type { MainChartSyncBridge } from '@/lib/chartSync';
import { formatCompact, formatCurrency, formatPercent } from '@/lib/utils';
import { useCryptoTabStore } from '@/store/cryptoTabStore';
import { useWatchlistStore } from '@/store/watchlistStore';
import type { CandleDataPoint, FinnhubQuote } from '@/types/finnhub';
import { FiChevronsLeft, FiChevronsRight, FiX } from 'react-icons/fi';

const findCoinName = (symbol: string): string =>
  CRYPTO_COINS.find((coin) => coin.symbol === symbol)?.name ?? symbol;

export default function CryptoDashboard(): JSX.Element {
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);
  const [tabletLeftOpen, setTabletLeftOpen] = useState(false);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [resolvedSymbol, setResolvedSymbol] = useState<string | null>(null);
  const [activeCandles, setActiveCandles] = useState<CandleDataPoint[]>([]);
  const [mainSyncBridge, setMainSyncBridge] = useState<MainChartSyncBridge | null>(null);
  const [quote, setQuote] = useState<FinnhubQuote | null>(null);
  const [loading, setLoading] = useState(true);

  const addSymbol = useWatchlistStore((state) => state.addSymbol);
  const { tabs, activeSymbol, openTab, closeTab, setActive } = useCryptoTabStore();
  const pushToastFn = useToastStore((state) => state.pushToast);
  const pushToastRef = useRef(pushToastFn);
  useEffect(() => {
    pushToastRef.current = pushToastFn;
  }, [pushToastFn]);
  const pushToast = useCallback((...args: Parameters<typeof pushToastFn>) => {
    pushToastRef.current(...args);
  }, []);

  useEffect(() => {
    const left = localStorage.getItem('leftSidebarOpen');
    const right = localStorage.getItem('rightSidebarOpen');
    if (left !== null) setLeftSidebarOpen(left === 'true');
    if (right !== null) setRightSidebarOpen(right === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('leftSidebarOpen', String(leftSidebarOpen));
  }, [leftSidebarOpen]);

  useEffect(() => {
    localStorage.setItem('rightSidebarOpen', String(rightSidebarOpen));
  }, [rightSidebarOpen]);

  useEffect(() => {
    let active = true;

    const loadQuote = async (): Promise<void> => {
      if (!activeSymbol) {
        if (!active) return;
        setQuote(null);
        setLoading(false);
        return;
      }

      if (!active) return;
      setLoading(true);
      await new Promise<void>((resolve) => {
        window.setTimeout(() => resolve(), 180);
      });
      if (!active) return;
      setQuote(getCryptoMockQuote(activeSymbol));
      setLoading(false);
    };

    void loadQuote();
    const intervalId = window.setInterval(() => {
      void loadQuote();
    }, 5000);

    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, [activeSymbol]);

  useEffect(() => {
    if (!activeSymbol) {
      setResolvedSymbol(null);
      return;
    }

    if (!loading) {
      setResolvedSymbol(activeSymbol);
    }
  }, [activeSymbol, loading]);

  useEffect(() => {
    document.title = activeSymbol ? `${activeSymbol} - Optimum` : 'Optimum';
  }, [activeSymbol]);

  const openCryptoTab = useCallback(
    (symbol: string, companyName?: string): void => {
      const opened = openTab({
        symbol,
        label: symbol,
        companyName: companyName ?? findCoinName(symbol),
      });

      if (!opened) {
        pushToast('Maximum tabs reached. Close a tab to open a new one.');
      }
    },
    [openTab, pushToast],
  );

  const metrics = useMemo(
    () => [
      {
        label: 'Current Price',
        value: quote ? formatCurrency(quote.c) : '-',
        accent: 'default' as const,
      },
      {
        label: 'Price Change',
        value: quote ? formatCurrency(quote.d) : '-',
        accent: quote && quote.d < 0 ? ('negative' as const) : ('positive' as const),
      },
      {
        label: '% Change',
        value: quote ? formatPercent(quote.dp) : '-',
        accent: quote && quote.dp < 0 ? ('negative' as const) : ('positive' as const),
      },
      {
        label: 'Volume',
        value: quote ? formatCompact(quote.v) : '-',
        accent: 'default' as const,
      },
      {
        label: 'Market Cap',
        value: quote ? `$${formatCompact(quote.marketCap, 2)}` : '-',
        accent: 'default' as const,
      },
    ],
    [quote],
  );

  const showInitialTabSkeleton = Boolean(activeSymbol) && resolvedSymbol !== activeSymbol;

  return (
    <main className="h-screen overflow-hidden bg-background-base text-text-primary">
      <MarketDataProvider />
      <DashboardHeader
        onOpenMarkets={() => setMobileLeftOpen(true)}
        onToggleMarkets={() => setTabletLeftOpen((value) => !value)}
        onOpenWatchlist={() => setMobileRightOpen(true)}
      />

      <div className="flex h-[calc(100vh-2.5rem)] overflow-hidden">
        <div className="relative hidden h-full md:block">
          <aside
            className={`h-full overflow-hidden transition-all duration-200 ease-in-out ${
              tabletLeftOpen ? 'md:w-64' : 'md:w-0'
            } ${leftSidebarOpen ? 'lg:w-64' : 'lg:w-0'}`}
          >
            <CryptoBrowser onOpenTab={() => undefined} />
          </aside>
          <button
            className={`absolute right-0 top-1/2 z-20 hidden ${leftSidebarOpen ? 'w-4' : 'w-8'} h-12 hover:bg-background-overlay -translate-y-1/2 translate-x-1/2 border border-border-subtle bg-background-surface text-xs text-text-secondary hover:text-text-primary lg:block`}
            onClick={() => setLeftSidebarOpen((value) => !value)}
            aria-label={leftSidebarOpen ? 'Collapse left sidebar' : 'Expand left sidebar'}
          >
            {leftSidebarOpen ? (
              <FiChevronsLeft className="w-3.5 h-3.5" />
            ) : (
              <FiChevronsRight className="w-3.5 h-3.5 ml-4" />
            )}
          </button>
        </div>

        <section className="flex min-w-0 flex-1 flex-col overflow-hidden border-r border-border-subtle md:border-r-0 lg:border-r-0">
          <TickerTape market="crypto" onOpenTab={openCryptoTab} />

          <section
            className={`${tabs.length > 0 && 'border-b'} border-border-subtle bg-background-base`}
          >
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

          <div
            className="min-h-0 flex-1 overflow-y-auto lg:flex lg:flex-col lg:overflow-hidden"
            style={{ scrollbarWidth: 'none' }}
          >
            {tabs.length === 0 || !activeSymbol ? (
              <div className="flex h-full items-center justify-center text-sm text-text-secondary">
                Select a stock to begin
              </div>
            ) : (
              <div
                key={activeSymbol}
                className="animate-[fadeIn_180ms_ease-out] lg:flex lg:min-h-0 lg:flex-1 lg:flex-col"
              >
                <section className="grid grid-cols-2 border-b border-border-subtle sm:grid-cols-3 md:grid-cols-5">
                  {metrics.map((metric, index) => (
                    <MetricsCard
                      key={metric.label}
                      label={metric.label}
                      value={metric.value}
                      loading={loading}
                      accent={metric.accent}
                      className={`
                      ${metric.label === 'Market Cap' ? 'col-span-2 sm:col-span-1' : ''}
                      ${index < metrics.length - 1 ? 'border-b border-border-subtle md:border-b-0' : ''}
                      ${
                        index === metrics.length - 1
                          ? 'border-r-0'
                          : '[&:not(:nth-child(2n))]:border-r [&:not(:nth-child(2n))]:border-border-subtle sm:[&:not(:nth-child(3n))]:border-r sm:[&:not(:nth-child(3n))]:border-border-subtle md:[&:not(:nth-child(5n))]:border-r md:[&:not(:nth-child(5n))]:border-border-subtle'
                      }
                    `}
                    />
                  ))}
                </section>

                {showInitialTabSkeleton ? (
                  <section className="border-b border-border-subtle p-3">
                    <Skeleton className="h-8 w-52" />
                    <Skeleton className="mt-3 h-[360px] w-full" />
                  </section>
                ) : (
                  <section className="flex min-h-0 flex-1 flex-col">
                    <Chart
                      symbol={activeSymbol}
                      market="crypto"
                      onCandlesChange={setActiveCandles}
                      onSyncBridgeChange={setMainSyncBridge}
                    />
                    <IndicatorPanel
                      candles={activeCandles}
                      activeSymbol={activeSymbol}
                      mainSyncBridge={mainSyncBridge}
                    />
                  </section>
                )}
              </div>
            )}
          </div>
        </section>

        <div className="relative hidden h-full md:block">
          <aside
            className={`h-full overflow-hidden transition-all duration-200 ease-in-out md:w-60 md:border-l md:border-border-subtle ${
              rightSidebarOpen
                ? 'lg:w-64 lg:border-l lg:border-border-subtle'
                : 'lg:w-0 lg:border-l-0'
            }`}
            style={{ scrollbarWidth: 'none' }}
          >
            <SearchBar
              market="crypto"
              onSelect={(symbol, companyName) => {
                addSymbol(symbol);
                openCryptoTab(symbol, companyName);
              }}
            />
            <Watchlist market="crypto" activeSymbol={activeSymbol} onOpenTab={openCryptoTab} />
          </aside>
          <button
            className={`absolute left-0 top-1/2 z-20 hidden ${rightSidebarOpen ? 'w-4' : 'w-8'} h-12 hover:bg-background-overlay -translate-x-1/2 -translate-y-1/2 border border-border-subtle bg-background-surface text-xs text-text-secondary hover:text-text-primary lg:block`}
            onClick={() => setRightSidebarOpen((value) => !value)}
            aria-label={rightSidebarOpen ? 'Collapse right sidebar' : 'Expand right sidebar'}
          >
            {rightSidebarOpen ? (
              <FiChevronsRight className="w-3.5 h-3.5 ml-px" />
            ) : (
              <FiChevronsLeft className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      <Drawer open={mobileLeftOpen} side="left" onClose={() => setMobileLeftOpen(false)}>
        <CryptoBrowser
          onOpenTab={() => {
            setMobileLeftOpen(false);
          }}
        />
      </Drawer>

      <Drawer open={mobileRightOpen} side="right" onClose={() => setMobileRightOpen(false)}>
        <section className="h-full overflow-y-hidden border-l border-border-subtle">
          <SearchBar
            market="crypto"
            onSelect={(symbol, companyName) => {
              addSymbol(symbol);
              openCryptoTab(symbol, companyName);
              setMobileRightOpen(false);
            }}
          />
          <Watchlist
            market="crypto"
            activeSymbol={activeSymbol}
            onOpenTab={(symbol) => {
              openCryptoTab(symbol);
              setMobileRightOpen(false);
            }}
          />
        </section>
      </Drawer>

      <Toast />
    </main>
  );
}

import { useMemo, useState } from 'react';
import ActivityFeed from '@/components/features/ActivityFeed';
import RSIChart from '@/components/features/indicators/RSIChart';
import BollingerChart from '@/components/features/indicators/BollingerChart';
import VolumeChart from '@/components/features/indicators/VolumeChart';
import KeyStatsGrid from '@/components/features/KeyStatsGrid';
import type { MainChartSyncBridge } from '@/lib/chartSync';
import type { CandleDataPoint } from '@/types/finnhub';

type IndicatorTab = 'TRADES' | 'RSI' | 'BB' | 'STATS' | 'Volume';

interface IndicatorPanelProps {
  candles: CandleDataPoint[];
  activeSymbol: string;
  mainSyncBridge: MainChartSyncBridge | null;
}

export default function IndicatorPanel({
  candles,
  activeSymbol,
  mainSyncBridge,
}: IndicatorPanelProps): JSX.Element {
  const [activeTab, setActiveTab] = useState<IndicatorTab>('TRADES');

  const content = useMemo(() => {
    if (activeTab === 'TRADES') {
      return <ActivityFeed symbol={activeSymbol} />;
    }

    if (activeTab === 'RSI') {
      return <RSIChart candles={candles} mainSyncBridge={mainSyncBridge} />;
    }

    if (activeTab === 'BB') {
      return <BollingerChart candles={candles} mainSyncBridge={mainSyncBridge} />;
    }

    if (activeTab === 'STATS') {
      return <KeyStatsGrid symbol={activeSymbol} candles={candles} />;
    }

    return <VolumeChart candles={candles} mainSyncBridge={mainSyncBridge} />;
  }, [activeTab, activeSymbol, candles, mainSyncBridge]);

  const tabs: IndicatorTab[] = ['TRADES', 'RSI', 'BB', 'STATS', 'Volume'];

  return (
    <section className="flex h-[312px] min-h-[312px] flex-col border-t border-border-subtle bg-background-surface lg:h-auto lg:min-h-0 lg:flex-1">
      <div className="hide-scrollbar overflow-hidden flex h-7 w-full overflow-x-auto border-b border-border-subtle bg-background-base">
        {tabs.map((tab) => {
          const active = tab === activeTab;

          return (
            <button
              key={tab}
              className={`h-7 border-r border-border-subtle px-4 font-mono text-xs ${
                active
                  ? 'border-t-2 border-t-accent bg-background-surface text-text-primary'
                  : 'bg-transparent text-text-secondary hover:text-text-primary'
              }`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div
        key={`${activeSymbol}${activeTab}`}
        className="relative flex-1 overflow-hidden animate-[fadeIn_180ms_ease-out]"
      >
        {content}
      </div>
    </section>
  );
}

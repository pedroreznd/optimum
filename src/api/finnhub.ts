import type {
  FinnhubCandles,
  FinnhubQuote,
  FinnhubSearchResponse,
  FinnhubWsMessage,
  Timeframe
} from '@/types/finnhub';
import { getMockCandles, getMockQuote, getMockWsTrade, SEARCH_RESULTS } from '@/mock/mockData';

const API_BASE_URL = import.meta.env.VITE_FINNHUB_API_BASE_URL;
const WS_URL = import.meta.env.VITE_FINNHUB_WS_URL;
const API_KEY = import.meta.env.VITE_FINNHUB_API_KEY;

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

export const finnhubConfig = {
  API_BASE_URL,
  WS_URL,
  API_KEY
} as const;

export const searchStocks = async (query: string): Promise<FinnhubSearchResponse> => {
  await wait(250);
  if (!query.trim()) {
    return { count: 0, result: [] };
  }

  const filtered = SEARCH_RESULTS.result.filter((stock) => {
    const normalizedQuery = query.toLowerCase();
    return (
      stock.symbol.toLowerCase().includes(normalizedQuery) ||
      stock.description.toLowerCase().includes(normalizedQuery)
    );
  });

  return { count: filtered.length, result: filtered };
};

export const getQuote = async (symbol: string): Promise<FinnhubQuote> => {
  await wait(180);
  return getMockQuote(symbol);
};

export const getCandles = async (symbol: string, timeframe: Timeframe): Promise<FinnhubCandles> => {
  await wait(300);
  return getMockCandles(symbol, timeframe);
};

export interface WebSocketClient {
  connect: () => void;
  disconnect: () => void;
  subscribe: (symbol: string) => void;
  unsubscribe: (symbol: string) => void;
}

export const createMockWebSocketClient = (
  onMessage: (message: FinnhubWsMessage) => void,
  onOpen: () => void,
  onClose: () => void,
  onError: (error: string) => void
): WebSocketClient => {
  let intervalId: number | null = null;
  const subscriptions = new Set<string>();

  return {
    connect: () => {
      if (intervalId) return;
      onOpen();
      intervalId = window.setInterval(() => {
        if (subscriptions.size === 0) return;
        const data = Array.from(subscriptions).map((symbol) => getMockWsTrade(symbol));
        onMessage({ type: 'trade', data });
      }, 1200);
    },
    disconnect: () => {
      if (intervalId) {
        window.clearInterval(intervalId);
        intervalId = null;
      }
      onClose();
    },
    subscribe: (symbol: string) => {
      subscriptions.add(symbol);
    },
    unsubscribe: (symbol: string) => {
      subscriptions.delete(symbol);
    }
  };
};

export const createRealWebSocketUrl = (): string => `${WS_URL}?token=${API_KEY}`;

export const reportMockSocketIssue = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return 'Unknown websocket error';
};

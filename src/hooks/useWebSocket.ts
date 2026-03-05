import { useCallback, useEffect, useRef, useState } from 'react';
import { createMockWebSocketClient } from '@/api/finnhub';
import type { FinnhubWsTrade } from '@/types/finnhub';

interface UseWebSocketResult {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  isEmpty: boolean;
  latestTrades: Record<string, FinnhubWsTrade>;
}

interface UseWebSocketOptions {
  symbols: string[];
  enabled?: boolean;
}

const MAX_RETRIES = 6;
const BASE_DELAY_MS = 700;

export const useWebSocket = ({ symbols, enabled = true }: UseWebSocketOptions): UseWebSocketResult => {
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [latestTrades, setLatestTrades] = useState<Record<string, FinnhubWsTrade>>({});

  const retriesRef = useRef(0);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const clientRef = useRef<ReturnType<typeof createMockWebSocketClient> | null>(null);
  const symbolsRef = useRef(symbols);
  const subscribedSymbolsRef = useRef<string[]>([]);

  useEffect(() => {
    symbolsRef.current = symbols;
  }, [symbols]);

  const clearReconnectTimeout = (): void => {
    if (reconnectTimeoutRef.current !== null) {
      window.clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  };

  const connect = useCallback(() => {
    if (!enabled) return;

    setConnecting(true);
    clientRef.current = createMockWebSocketClient(
      (message) => {
        if (message.type !== 'trade' || !message.data) return;

        setLatestTrades((prev) => {
          const next = { ...prev };
          message.data?.forEach((trade) => {
            next[trade.s] = trade;
          });
          return next;
        });
      },
      () => {
        setConnected(true);
        setConnecting(false);
        setError(null);
        retriesRef.current = 0;
        symbolsRef.current.forEach((symbol) => clientRef.current?.subscribe(symbol));
        subscribedSymbolsRef.current = [...symbolsRef.current];
      },
      () => {
        setConnected(false);
        setConnecting(false);

        if (retriesRef.current < MAX_RETRIES && enabled) {
          const delay = BASE_DELAY_MS * 2 ** retriesRef.current;
          retriesRef.current += 1;
          reconnectTimeoutRef.current = window.setTimeout(() => {
            connect();
          }, delay);
        }
      },
      (socketError) => {
        setError(socketError);
      }
    );

    try {
      clientRef.current.connect();
    } catch (err) {
      setConnecting(false);
      setError(err instanceof Error ? err.message : 'WebSocket connection failed');
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    connect();

    return () => {
      clearReconnectTimeout();
      clientRef.current?.disconnect();
      clientRef.current = null;
      subscribedSymbolsRef.current = [];
    };
  }, [enabled, connect]);

  useEffect(() => {
    if (!connected || !clientRef.current) return;

    const nextSet = new Set(symbols);
    const prevSet = new Set(subscribedSymbolsRef.current);

    symbols.forEach((symbol) => {
      if (!prevSet.has(symbol)) {
        clientRef.current?.subscribe(symbol);
      }
    });

    subscribedSymbolsRef.current.forEach((symbol) => {
      if (!nextSet.has(symbol)) {
        clientRef.current?.unsubscribe(symbol);
      }
    });

    subscribedSymbolsRef.current = [...symbols];
  }, [symbols, connected]);

  return {
    connected,
    connecting,
    error,
    isEmpty: symbols.length === 0,
    latestTrades
  };
};

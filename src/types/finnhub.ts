export interface FinnhubSearchResult {
  description: string;
  displaySymbol: string;
  symbol: string;
  type: string;
}

export interface FinnhubSearchResponse {
  count: number;
  result: FinnhubSearchResult[];
}

export interface FinnhubQuote {
  c: number;
  d: number;
  dp: number;
  h: number;
  l: number;
  o: number;
  pc: number;
  t: number;
  v: number;
  marketCap: number;
}

export interface FinnhubCandles {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  s: 'ok' | 'no_data';
  t: number[];
  v: number[];
}

export interface FinnhubWsTrade {
  p: number;
  s: string;
  t: number;
  v: number;
}

export interface FinnhubWsMessage {
  data?: FinnhubWsTrade[];
  type: 'trade' | 'ping';
}

export type Timeframe = '1D' | '1W' | '1M' | '3M';

export interface StockListItem {
  symbol: string;
  name: string;
}

export interface CandleDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

<p align="center">
  <img src="https://github.com/user-attachments/assets/87e2daae-d948-418a-a4e3-cea5b3fd6d4d" width="480" alt="Optimum" />
</p>

<p align="center">
  Real-time stocks and crypto market dashboard — React, TypeScript, TradingView Lightweight Charts.
</p>

<br />

<p align="center">
  <a href="https://optimumdev.xyz">Live Demo</a>
</p>

<br />

<img width="1920" height="1080" alt="Optimum Dashboard" src="https://github.com/user-attachments/assets/ed3ca717-c838-4e4f-8b37-8cda30bb73b0" />

<br />

## Features

**Stocks & Crypto**
- Dual market support — fully independent stocks and crypto sections with separate watchlists, tab systems, and ticker tapes
- Real-time WebSocket price updates via Finnhub
- Candlestick / line chart with 1D, 1W, 1M, 3M timeframe selector
- RSI, Bollinger Bands, and Volume indicator panel with crosshair sync
- Stock and crypto browser with browser-style tab system (max 8 tabs)
- Watchlist with live prices and sparklines per asset
- Ticker tape with imperative DOM updates — zero React re-renders on price ticks

**Architecture**
- Centralized market data store with mutable price cache to decouple WebSocket frequency from React render cycles
- Single WebSocket connection owned by `MarketDataProvider`, consumed globally via Zustand
- Design token system — all colors defined once in `tailwind.config.ts` and `src/lib/theme.ts`
- Manual implementations of RSI, Bollinger Bands, and Volume SMA in `src/lib/indicators.ts`

**UX**
- Collapsible sidebars with animated full-height expand buttons and localStorage persistence
- Responsive layout — overlay drawers on mobile, collapsible panels on desktop
- PWA support with offline fallback page
- Animated nav transitions between markets using Framer Motion

## Tech Stack

| | |
|---|---|
| Framework | Vite + React 18 + TypeScript (strict) |
| Styling | TailwindCSS with centralized design tokens |
| State | Zustand |
| Charts | TradingView Lightweight Charts |
| Animation | Framer Motion |
| Data | Finnhub API (WebSocket + REST) |
| PWA | vite-plugin-pwa |

## Getting Started

**Prerequisites:** Node.js 18+
```bash
git clone https://github.com/pedroreznd/optimum.git
cd optimum
npm install
cp .env.example .env   # add your Finnhub API key
npm run dev
```

> A free Finnhub API key is available at [finnhub.io](https://finnhub.io). The app runs fully on mock data without one.

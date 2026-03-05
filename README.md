# Optimum

Optimum — A real-time stock market dashboard built with React, TypeScript, and TradingView Lightweight Charts.

![Dashboard preview](./docs/dashboard-preview.png)
<!-- TODO: add screenshot -->

## Features

- Real-time WebSocket price updates
- Candlestick/line chart with timeframe selector
- RSI / Bollinger Bands / Volume indicator panel
- Collapsible sidebars with localStorage persistence
- Stock browser with tab system (max 8 tabs)
- Watchlist with sparklines
- Ticker tape with live prices
- PWA support with offline fallback
- Fully responsive layout with mobile drawer navigation

## Tech Stack

- Vite + React 18 + TypeScript (strict)
- TailwindCSS
- Zustand
- TradingView Lightweight Charts
- Finnhub API
- vite-plugin-pwa

## Getting Started

### Prerequisites

- Node.js 18+

### Setup

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and add your Finnhub API key.
4. Start the development server:
   ```bash
   npm run dev
   ```

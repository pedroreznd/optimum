# Optimum

Optimum — A real-time stock market dashboard built with React, TypeScript, and TradingView Lightweight Charts.

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/78eb1b60-3f79-4942-a464-d75c46f05088" />

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
4. Copy `.env.example` to `.env` and add your Finnhub API key.
5. Start the development server:
   
   ```bash
   npm run dev
   ```

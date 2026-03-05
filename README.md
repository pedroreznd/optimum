# Stock Dashboard

## Overview

Stock Dashboard is a React + TypeScript Progressive Web App scaffold for a real-time stock market dashboard. It includes search, watchlist persistence, mocked live price updates, charting, and offline support. The app is fully typed and uses mock data shaped like Finnhub responses so real APIs can be connected later by changing only the API layer.

## Tech decisions

- React 18 + TypeScript strict mode for predictable UI behavior and safe refactors.
- Vite for fast local dev and production builds.
- TailwindCSS with dark mode (`class` strategy) for utility-first styling.
- Zustand with `persist` middleware for localStorage-backed watchlist state.
- Lightweight Charts by TradingView for performant candlestick and line charts.
- `vite-plugin-pwa` with an InjectManifest service worker for custom caching strategy control.
- Mock API module (`src/api`) mirrors Finnhub response contracts to keep integration boundaries clear.

## Architecture

- `src/api/`: Typed mock Finnhub REST and WebSocket integration.
- `src/components/ui/`: Reusable presentational primitives (`Button`, `Badge`, `Card`, `Skeleton`).
- `src/components/features/`: Feature-level building blocks (`Chart`, `Watchlist`, `SearchBar`, `MetricsCard`, `TickerTape`).
- `src/hooks/`: Data hooks for search debounce, quote polling, candles fetch, and resilient websocket updates.
- `src/store/`: Persisted Zustand watchlist store.
- `src/types/`: Finnhub domain models.
- `src/lib/utils.ts`: Formatting and helper utilities.
- `src/pages/`: Route-level screens (`Dashboard`, `StockDetail`, `OfflinePage`).
- `src/service-worker.ts`: PWA runtime caching rules.

## How to run

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```
5. Preview production build:
   ```bash
   npm run preview
   ```

## Environment Variables

- Copy `.env.example` to `.env` at the project root.
- `VITE_FINNHUB_API_KEY` is required for recent trades/activity feed requests.
- You can generate a free API key by creating an account at `https://finnhub.io` and using the key in your `.env` file.
- `VITE_FINNHUB_API_BASE_URL` and `VITE_FINNHUB_WS_URL` are already included in the example file for REST/WebSocket integration scaffolding.

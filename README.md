# Trading Bot Dashboard

A React/TypeScript dashboard for monitoring and controlling your trading bot via REST API.

## Features

- **Authentication**: Automatic JWT token management
- **Real-time Status**: WebSocket connection monitoring (5-second polling)
- **Bot Controls**: Toggle WS Strategy and Validation Warmup modes
- **Quick Trade**: Manual order execution with market data preview
- **Validation**: Run probability validation analysis
- **Error Handling**: Comprehensive error states with user-friendly messages

## Setup

1. **Environment Configuration**
   ```bash
   cp .env.example .env
   ```
   
   Configure your API base URL in `.env`:
   ```
   VITE_API_BASE=http://127.0.0.1:8000
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open in Browser**
   ```
   http://localhost:5173
   ```

## API Requirements

Your backend must be running at the configured `VITE_API_BASE` URL with the following endpoints:

### Authentication
- `POST /api/v2/auth/ws-token` - Get JWT token

### Status Monitoring
- `GET /api/v2/ws/pool/status` - WebSocket connection status
- `GET /api/v2/ui/capabilities` - UI feature capabilities

### Bot Controls
- `POST /api/v2/mode/ws-strategy` - Toggle WebSocket strategy
- `POST /api/v2/mode/validation-warmup` - Toggle validation warmup

### Trading
- `GET /api/v2/market/ticker/:symbol` - Get market data
- `POST /api/v2/order` - Place orders

### Validation
- `POST /api/v2/prob/validate/run` - Run probability validation

## Usage

### Dashboard Overview
- View system status and bot configuration
- Monitor WebSocket connections and subscriptions
- Check API connectivity and environment settings

### Quick Trade
- Select symbols (tBTCUSD, tETHUSD, tTEST...)
- Choose BUY/SELL side
- Set amount and optional limit price
- Preview market data before trading
- Execute orders and view raw API responses

### Validation
- Select multiple symbols for analysis
- Configure timeframe (1m, 5m, 15m, 30m, 1h, 4h, 1D)
- Set optional limits and sample sizes
- Run validation and view JSON results

### Settings
- Toggle bot operational modes
- View API configuration
- Check authentication status

## Key Components

- **StatusCard**: Real-time WebSocket status monitoring
- **Toggles**: Bot mode controls with loading states
- **QuickTrade**: Manual trading interface with market preview
- **ValidationPanel**: Strategy validation with configurable parameters

## Error Handling

- Automatic JWT token refresh on 401 errors
- Non-blocking status polling
- User-friendly error messages via toast notifications
- Graceful degradation when API is unavailable

## Development

The dashboard is built with:
- React 18 + TypeScript
- Vite for development and building
- shadcn/ui components
- Tailwind CSS for styling
- Sonner for notifications

All form values and preferences are persisted in localStorage for better user experience.
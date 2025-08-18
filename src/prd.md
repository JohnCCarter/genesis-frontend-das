# Trading Bot Dashboard PRD

## Core Purpose & Success
- **Mission Statement**: A React/TypeScript dashboard for monitoring and controlling a trading bot via REST API interactions
- **Success Indicators**: Successful JWT authentication, real-time WebSocket status monitoring, working toggle controls, functional Quick Trade interface, and validation capabilities
- **Experience Qualities**: Professional, responsive, reliable

## Project Classification & Approach
- **Complexity Level**: Light Application (multiple features with basic state management)
- **Primary User Activity**: Acting and Monitoring (controlling trading bot and monitoring status)

## Essential Features

### Authentication System
- **Functionality**: JWT token acquisition and management via POST /api/v2/auth/ws-token
- **Purpose**: Secure API access with Bearer token authentication
- **Storage**: localStorage with key 'jwt'

### Status Monitoring
- **Functionality**: Real-time WebSocket connection status polling every 5 seconds
- **Purpose**: Monitor bot connectivity and active subscriptions
- **API**: GET /api/v2/ws/pool/status and GET /api/v2/ui/capabilities

### Toggle Controls
- **Functionality**: Enable/disable WS Strategy and Validation Warmup modes
- **Purpose**: Runtime control of bot behavior
- **API**: POST /api/v2/mode/ws-strategy and POST /api/v2/mode/validation-warmup

### Quick Trade Interface
- **Functionality**: Symbol selection, trade preview, and order execution
- **Purpose**: Manual trading capabilities with market data preview
- **API**: GET /api/v2/market/ticker/:symbol and POST /api/v2/order

### Validation Panel
- **Functionality**: Run probability validation with configurable parameters
- **Purpose**: Analyze trading strategies before execution
- **API**: POST /api/v2/prob/validate/run

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Confidence, control, precision
- **Design Personality**: Professional, modern, data-focused
- **Visual Metaphors**: Financial dashboards, trading terminals
- **Simplicity Spectrum**: Clean interface with dense information display

### Color Strategy
- **Color Scheme Type**: Custom financial palette
- **Primary Color**: Deep blue (#1e40af) - trust and stability
- **Secondary Colors**: Dark grays for backgrounds, white for text
- **Accent Color**: Electric blue (#3b82f6) for CTAs and active states
- **Success/Error**: Green (#10b981) for success, Red (#ef4444) for errors
- **Foreground/Background Pairings**: 
  - White text on dark backgrounds (WCAG AA compliant)
  - Dark text on light cards
  - High contrast for data readability

### Typography System
- **Font Pairing Strategy**: Inter for all text (consistent, modern)
- **Typographic Hierarchy**: Bold headings, regular body, tabular numbers
- **Font Personality**: Clean, professional, highly legible
- **Which fonts**: Inter (Google Fonts)
- **Legibility Check**: Optimized for financial data display

### UI Elements & Component Selection
- **Component Usage**: shadcn/ui components for consistency
- **Cards**: Status displays, form containers
- **Buttons**: Primary actions, toggles, form submissions
- **Badges**: Status indicators, connection states
- **Tables**: Trade history, validation results
- **Forms**: Trade inputs, validation parameters

### Animations
- **Purposeful Meaning**: Subtle feedback for state changes
- **Loading States**: Spinners for API calls
- **Status Updates**: Smooth transitions for connection states

## Implementation Considerations

### API Integration
- **Base URL**: VITE_API_BASE environment variable
- **Authentication**: JWT Bearer tokens with automatic refresh
- **Error Handling**: Comprehensive error states with user-friendly messages
- **Polling**: Non-blocking 5-second intervals for status updates

### State Management
- **Local Storage**: Form values, JWT tokens
- **React State**: Component state, API responses
- **Persistence**: Critical user preferences and session data

### Environment Configuration
- **DRY_RUN_ENABLED**: Toggle for demo/live modes
- **WS_SUBSCRIBE_SYMBOLS**: Auto-subscription management
- **AUTH_REQUIRED**: Security enforcement

## Edge Cases & Problem Scenarios
- **Network Failures**: Graceful degradation with retry mechanisms
- **Authentication Expiry**: Automatic token refresh
- **API Errors**: Clear error messages with recovery options
- **WebSocket Disconnections**: Status indicators and reconnection logic

## Testing Focus
- **API Integration**: All endpoints properly authenticated
- **Error Handling**: Network failures and API errors
- **State Persistence**: localStorage functionality
- **Real-time Updates**: WebSocket status polling accuracy

## Reflection
This dashboard provides essential trading bot control while maintaining security and reliability. The focus on real-time status monitoring and clear error handling ensures operators can confidently manage their trading systems.
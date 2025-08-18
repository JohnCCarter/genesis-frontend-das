const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

export interface AuthTokenResponse {
  token: string
}

export interface WSPoolStatus {
  main: {
    connected: boolean
    authenticated: boolean
  }
  subscriptions: string[]
}

export interface UICapabilities {
  ws: {
    strategy_enabled: boolean
  }
  prob: boolean
  dry_run: boolean
  rate_limit: boolean
}

export interface ModeResponse {
  ok: boolean
  ws_strategy_enabled?: boolean
  validation_on_start?: boolean
}

export interface TickerData {
  last_price: number
  bid: number
  ask: number
  symbol: string
  timestamp?: number
}

export interface OrderRequest {
  symbol: string
  amount: number
  type: 'EXCHANGE MARKET' | 'EXCHANGE LIMIT'
  price?: number
}

export interface OrderResponse {
  success: boolean
  error?: string
  data?: any
}

export interface ValidationRequest {
  symbols: string[]
  timeframe: string
  limit?: number
  max_samples?: number
}

/**
 * Ensures a valid JWT token exists in localStorage
 * If not present, fetches a new one from the auth endpoint
 */
export async function ensureToken(): Promise<string> {
  let token = localStorage.getItem('jwt')
  
  if (!token) {
    try {
      const response = await fetch(`${API_BASE}/api/v2/auth/ws-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'dashboard_user',
          scope: 'read',
          expiry_hours: 24
        })
      })

      if (!response.ok) {
        throw new Error(`Auth failed: ${response.status} ${response.statusText}`)
      }

      const data: AuthTokenResponse = await response.json()
      token = data.token
      localStorage.setItem('jwt', token)
    } catch (error) {
      console.error('Failed to get auth token:', error)
      throw new Error('Authentication failed. Please check your connection.')
    }
  }

  return token
}

/**
 * Generic GET request with automatic token handling
 */
export async function get<T>(path: string): Promise<T> {
  const token = await ensureToken()
  
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Token might be expired, clear it and retry once
      localStorage.removeItem('jwt')
      const newToken = await ensureToken()
      
      const retryResponse = await fetch(`${API_BASE}${path}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        }
      })
      
      if (!retryResponse.ok) {
        throw new Error(`Request failed: ${retryResponse.status} ${retryResponse.statusText}`)
      }
      
      return retryResponse.json()
    }
    
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

/**
 * Generic POST request with automatic token handling
 */
export async function post<T>(path: string, body?: any): Promise<T> {
  const token = await ensureToken()
  
  const response = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined
  })

  if (!response.ok) {
    if (response.status === 401) {
      // Token might be expired, clear it and retry once
      localStorage.removeItem('jwt')
      const newToken = await ensureToken()
      
      const retryResponse = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined
      })
      
      if (!retryResponse.ok) {
        throw new Error(`Request failed: ${retryResponse.status} ${retryResponse.statusText}`)
      }
      
      return retryResponse.json()
    }
    
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  return response.json()
}

// Specific API functions
export const api = {
  // Authentication
  getToken: () => ensureToken(),

  // Status and capabilities
  getWSPoolStatus: () => get<WSPoolStatus>('/api/v2/ws/pool/status'),
  getUICapabilities: () => get<UICapabilities>('/api/v2/ui/capabilities'),

  // Mode toggles
  setWSStrategy: (enabled: boolean) => 
    post<ModeResponse>('/api/v2/mode/ws-strategy', { enabled }),
  setValidationWarmup: (enabled: boolean) => 
    post<ModeResponse>('/api/v2/mode/validation-warmup', { enabled }),

  // Market data
  getTicker: (symbol: string) => 
    get<TickerData>(`/api/v2/market/ticker/${symbol}`),

  // Orders
  createOrder: (order: OrderRequest) => 
    post<OrderResponse>('/api/v2/order', order),

  // Validation
  runValidation: (params: ValidationRequest) => 
    post<any>('/api/v2/prob/validate/run', params),
}
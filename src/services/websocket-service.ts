interface CryptoPrice {
  symbol: string
  price: number
  change24h: number
  changePercent24h: number
  high24h: number
  low24h: number
  volume24h: number
  lastUpdate: number
}

interface BinanceStreamData {
  e: string // Event type
  E: number // Event time
  s: string // Symbol
  c: string // Close price
  o: string // Open price
  h: string // High price
  l: string // Low price
  v: string // Volume
  q: string // Quote volume
  P: string // Price change percent
  p: string // Price change
  Q: string // Last quantity
  F: number // First trade ID
  L: number // Last trade ID
  n: number // Total number of trades
}

interface TradingData {
  portfolioValue: number
  dailyPnL: number
  totalPnL: number
  activePositions: number
  timestamp: number
}

export class WebSocketService {
  private static instance: WebSocketService
  private priceSocket: WebSocket | null = null
  private tradingSocket: WebSocket | null = null
  private priceSubscribers: Map<string, ((prices: Map<string, CryptoPrice>) => void)[]> = new Map()
  private tradingSubscribers: Map<string, ((data: TradingData) => void)[]> = new Map()
  private connectionStatusSubscribers: ((status: 'connected' | 'disconnected' | 'connecting') => void)[] = []
  private prices: Map<string, CryptoPrice> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000
  private isConnecting = false
  
  // Symbols to track
  private readonly SYMBOLS = ['btcusdt', 'ethusdt', 'adausdt', 'solusdt', 'dotusdt', 'avaxusdt']
  
  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService()
    }
    return WebSocketService.instance
  }

  async start(): Promise<void> {
    this.connectPriceStream()
    this.connectTradingStream()
  }

  stop(): void {
    this.closePriceStream()
    this.closeTradingStream()
  }

  // Price stream methods
  subscribeToPrices(callback: (prices: Map<string, CryptoPrice>) => void): () => void {
    if (!this.priceSubscribers.has('global')) {
      this.priceSubscribers.set('global', [])
    }
    
    this.priceSubscribers.get('global')!.push(callback)
    
    // Send current prices immediately if available
    if (this.prices.size > 0) {
      callback(new Map(this.prices))
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.priceSubscribers.get('global')
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  // Trading data stream methods
  subscribeToTradingData(callback: (data: TradingData) => void): () => void {
    if (!this.tradingSubscribers.has('global')) {
      this.tradingSubscribers.set('global', [])
    }
    
    this.tradingSubscribers.get('global')!.push(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.tradingSubscribers.get('global')
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  // Connection status subscription
  subscribeToConnectionStatus(callback: (status: 'connected' | 'disconnected' | 'connecting') => void): () => void {
    this.connectionStatusSubscribers.push(callback)
    
    // Send current status immediately
    callback(this.getConnectionStatus())

    return () => {
      const index = this.connectionStatusSubscribers.indexOf(callback)
      if (index > -1) {
        this.connectionStatusSubscribers.splice(index, 1)
      }
    }
  }

  private connectPriceStream(): void {
    if (this.isConnecting || this.priceSocket?.readyState === WebSocket.OPEN) {
      return
    }

    this.isConnecting = true
    this.notifyConnectionStatus('connecting')

    try {
      // Binance WebSocket stream for 24hr ticker data
      const streamNames = this.SYMBOLS.map(symbol => `${symbol}@ticker`).join('/')
      const wsUrl = `wss://stream.binance.com:9443/ws/${streamNames}`
      
      this.priceSocket = new WebSocket(wsUrl)

      this.priceSocket.onopen = () => {
        console.log('Price WebSocket connected')
        this.reconnectAttempts = 0
        this.isConnecting = false
        this.notifyConnectionStatus('connected')
      }

      this.priceSocket.onmessage = (event) => {
        try {
          const data: BinanceStreamData = JSON.parse(event.data)
          this.handlePriceUpdate(data)
        } catch (error) {
          console.error('Error parsing price data:', error)
        }
      }

      this.priceSocket.onclose = (event) => {
        console.log('Price WebSocket closed:', event.code, event.reason)
        this.isConnecting = false
        this.notifyConnectionStatus('disconnected')
        this.handlePriceReconnect()
      }

      this.priceSocket.onerror = (error) => {
        console.error('Price WebSocket error:', error)
        this.isConnecting = false
        this.notifyConnectionStatus('disconnected')
      }

    } catch (error) {
      console.error('Failed to create price WebSocket:', error)
      this.isConnecting = false
      this.notifyConnectionStatus('disconnected')
      this.handlePriceReconnect()
    }
  }

  private connectTradingStream(): void {
    // Simulate trading bot WebSocket connection
    // In a real implementation, this would connect to your trading bot's WebSocket endpoint
    try {
      // For demo purposes, we'll simulate trading data updates
      this.simulateTradingUpdates()
    } catch (error) {
      console.error('Failed to connect to trading stream:', error)
    }
  }

  private simulateTradingUpdates(): void {
    // Simulate real-time trading data updates every 2-5 seconds
    const updateInterval = () => {
      const basePortfolio = 125430.50
      const variation = (Math.random() - 0.5) * 1000 // Random variation up to ±$500
      
      const tradingData: TradingData = {
        portfolioValue: basePortfolio + variation,
        dailyPnL: 2340.75 + (Math.random() - 0.5) * 200,
        totalPnL: 23450.30 + variation * 2,
        activePositions: Math.floor(Math.random() * 3) + 6, // 6-8 positions
        timestamp: Date.now()
      }

      this.notifyTradingSubscribers(tradingData)
      
      // Schedule next update in 2-5 seconds
      setTimeout(updateInterval, 2000 + Math.random() * 3000)
    }
    
    // Start the simulation
    setTimeout(updateInterval, 1000)
  }

  private handlePriceUpdate(data: BinanceStreamData): void {
    const symbol = data.s.replace('USDT', '').toUpperCase()
    
    const price: CryptoPrice = {
      symbol,
      price: parseFloat(data.c),
      change24h: parseFloat(data.p),
      changePercent24h: parseFloat(data.P),
      high24h: parseFloat(data.h),
      low24h: parseFloat(data.l),
      volume24h: parseFloat(data.v),
      lastUpdate: data.E
    }
    
    this.prices.set(symbol, price)
    this.notifyPriceSubscribers()
  }

  private notifyPriceSubscribers(): void {
    const callbacks = this.priceSubscribers.get('global') || []
    callbacks.forEach(callback => {
      callback(new Map(this.prices))
    })
  }

  private notifyTradingSubscribers(data: TradingData): void {
    const callbacks = this.tradingSubscribers.get('global') || []
    callbacks.forEach(callback => {
      callback(data)
    })
  }

  private notifyConnectionStatus(status: 'connected' | 'disconnected' | 'connecting'): void {
    this.connectionStatusSubscribers.forEach(callback => {
      callback(status)
    })
  }

  private handlePriceReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached for price stream')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)
    
    console.log(`Attempting to reconnect price stream in ${delay}ms (attempt ${this.reconnectAttempts})`)
    
    setTimeout(() => {
      this.connectPriceStream()
    }, delay)
  }

  private closePriceStream(): void {
    if (this.priceSocket) {
      this.priceSocket.close()
      this.priceSocket = null
    }
  }

  private closeTradingStream(): void {
    if (this.tradingSocket) {
      this.tradingSocket.close()
      this.tradingSocket = null
    }
  }

  private getConnectionStatus(): 'connected' | 'disconnected' | 'connecting' {
    if (this.isConnecting) return 'connecting'
    if (this.priceSocket?.readyState === WebSocket.OPEN) return 'connected'
    return 'disconnected'
  }

  // Public getters
  getPrices(): Map<string, CryptoPrice> {
    return new Map(this.prices)
  }

  getPrice(symbol: string): CryptoPrice | undefined {
    return this.prices.get(symbol.toUpperCase())
  }

  isConnected(): boolean {
    return this.priceSocket?.readyState === WebSocket.OPEN
  }
}
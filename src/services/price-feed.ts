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

interface BinanceTickerResponse {
  symbol: string
  priceChange: string
  priceChangePercent: string
  weightedAvgPrice: string
  prevClosePrice: string
  lastPrice: string
  lastQty: string
  bidPrice: string
  askPrice: string
  openPrice: string
  highPrice: string
  lowPrice: string
  volume: string
  quoteVolume: string
  openTime: number
  closeTime: number
  firstId: number
  lastId: number
  count: number
}

export class PriceFeedService {
  private static instance: PriceFeedService
  private subscribers: Map<string, ((prices: Map<string, CryptoPrice>) => void)[]> = new Map()
  private prices: Map<string, CryptoPrice> = new Map()
  private intervalId: number | null = null
  private readonly SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'ADAUSDT', 'SOLUSDT', 'DOTUSDT', 'AVAXUSDT']
  private readonly API_BASE = 'https://api.binance.com/api/v3'

  static getInstance(): PriceFeedService {
    if (!PriceFeedService.instance) {
      PriceFeedService.instance = new PriceFeedService()
    }
    return PriceFeedService.instance
  }

  async start(): Promise<void> {
    // Initial fetch
    await this.fetchPrices()
    
    // Update every 5 seconds
    this.intervalId = window.setInterval(() => {
      this.fetchPrices()
    }, 5000)
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  subscribe(callback: (prices: Map<string, CryptoPrice>) => void): () => void {
    const id = Math.random().toString(36)
    
    if (!this.subscribers.has('global')) {
      this.subscribers.set('global', [])
    }
    
    this.subscribers.get('global')!.push(callback)
    
    // Send current prices immediately if available
    if (this.prices.size > 0) {
      callback(new Map(this.prices))
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscribers.get('global')
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  private async fetchPrices(): Promise<void> {
    try {
      const symbolsParam = this.SYMBOLS.join(',')
      const response = await fetch(`${this.API_BASE}/ticker/24hr?symbols=["${this.SYMBOLS.join('","')}"]`)
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }

      const data: BinanceTickerResponse[] = await response.json()
      
      data.forEach(ticker => {
        const symbol = ticker.symbol.replace('USDT', '')
        const price: CryptoPrice = {
          symbol,
          price: parseFloat(ticker.lastPrice),
          change24h: parseFloat(ticker.priceChange),
          changePercent24h: parseFloat(ticker.priceChangePercent),
          high24h: parseFloat(ticker.highPrice),
          low24h: parseFloat(ticker.lowPrice),
          volume24h: parseFloat(ticker.volume),
          lastUpdate: Date.now()
        }
        
        this.prices.set(symbol, price)
      })

      // Notify all subscribers
      const callbacks = this.subscribers.get('global') || []
      callbacks.forEach(callback => {
        callback(new Map(this.prices))
      })

    } catch (error) {
      console.error('Failed to fetch crypto prices:', error)
    }
  }

  getPrices(): Map<string, CryptoPrice> {
    return new Map(this.prices)
  }

  getPrice(symbol: string): CryptoPrice | undefined {
    return this.prices.get(symbol)
  }
}
import { useState, useEffect } from 'react'
import { PriceFeedService } from '@/services/price-feed'

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

export function usePriceFeed() {
  const [prices, setPrices] = useState<Map<string, CryptoPrice>>(new Map())
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<number>(0)

  useEffect(() => {
    const priceFeedService = PriceFeedService.getInstance()
    
    // Subscribe to price updates
    const unsubscribe = priceFeedService.subscribe((newPrices) => {
      setPrices(newPrices)
      setIsConnected(true)
      setLastUpdate(Date.now())
    })

    // Start the price feed
    priceFeedService.start().catch(error => {
      console.error('Failed to start price feed:', error)
      setIsConnected(false)
    })

    // Cleanup on unmount
    return () => {
      unsubscribe()
      priceFeedService.stop()
    }
  }, [])

  // Check connection status based on last update time
  useEffect(() => {
    const checkConnection = () => {
      const now = Date.now()
      const timeSinceUpdate = now - lastUpdate
      
      // Consider disconnected if no update for more than 30 seconds
      if (timeSinceUpdate > 30000 && lastUpdate > 0) {
        setIsConnected(false)
      }
    }

    const interval = setInterval(checkConnection, 5000)
    return () => clearInterval(interval)
  }, [lastUpdate])

  return {
    prices: Array.from(prices.values()),
    pricesMap: prices,
    isConnected,
    lastUpdate,
    getPrice: (symbol: string) => prices.get(symbol)
  }
}
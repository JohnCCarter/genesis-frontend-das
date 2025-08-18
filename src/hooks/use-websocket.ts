import { useState, useEffect, useCallback } from 'react'
import { WebSocketService } from '@/services/websocket-service'

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

interface TradingData {
  portfolioValue: number
  dailyPnL: number
  totalPnL: number
  activePositions: number
  timestamp: number
}

type ConnectionStatus = 'connected' | 'disconnected' | 'connecting'

export function useWebSocket() {
  const [prices, setPrices] = useState<Map<string, CryptoPrice>>(new Map())
  const [tradingData, setTradingData] = useState<TradingData | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected')
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize WebSocket service
  useEffect(() => {
    const wsService = WebSocketService.getInstance()
    
    // Subscribe to price updates
    const unsubscribePrices = wsService.subscribeToPrices((newPrices) => {
      setPrices(newPrices)
    })

    // Subscribe to trading data updates
    const unsubscribeTradingData = wsService.subscribeToTradingData((data) => {
      setTradingData(data)
    })

    // Subscribe to connection status
    const unsubscribeConnectionStatus = wsService.subscribeToConnectionStatus((status) => {
      setConnectionStatus(status)
    })

    // Start the WebSocket connections
    if (!isInitialized) {
      wsService.start()
      setIsInitialized(true)
    }

    // Cleanup function
    return () => {
      unsubscribePrices()
      unsubscribeTradingData()
      unsubscribeConnectionStatus()
    }
  }, [isInitialized])

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isInitialized) {
        const wsService = WebSocketService.getInstance()
        wsService.stop()
      }
    }
  }, [isInitialized])

  const reconnect = useCallback(() => {
    const wsService = WebSocketService.getInstance()
    wsService.stop()
    setTimeout(() => {
      wsService.start()
    }, 1000)
  }, [])

  const getPrice = useCallback((symbol: string): CryptoPrice | undefined => {
    return prices.get(symbol.toUpperCase())
  }, [prices])

  const getPricesArray = useCallback((): CryptoPrice[] => {
    return Array.from(prices.values()).sort((a, b) => a.symbol.localeCompare(b.symbol))
  }, [prices])

  return {
    prices: getPricesArray(),
    pricesMap: prices,
    tradingData,
    connectionStatus,
    isConnected: connectionStatus === 'connected',
    isConnecting: connectionStatus === 'connecting',
    getPrice,
    reconnect,
  }
}
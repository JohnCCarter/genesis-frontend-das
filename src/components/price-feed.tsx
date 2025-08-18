import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TrendingUp, TrendingDown, Minus } from '@phosphor-icons/react'
import { useWebSocket } from '@/hooks/use-websocket'

function formatPrice(price: number): string {
  if (price >= 1000) {
    return price.toLocaleString('en-US', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })
  } else if (price >= 1) {
    return price.toFixed(4)
  } else {
    return price.toFixed(6)
  }
}

function formatVolume(volume: number): string {
  if (volume >= 1000000) {
    return `${(volume / 1000000).toFixed(1)}M`
  } else if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}K`
  }
  return volume.toFixed(0)
}

export default function PriceFeed() {
  const { prices, isConnected, isConnecting } = useWebSocket()

  const getLastUpdate = () => {
    if (prices.length === 0) return null
    const latestUpdate = Math.max(...prices.map(p => p.lastUpdate))
    const seconds = Math.floor((Date.now() - latestUpdate) / 1000)
    if (seconds < 5) return 'Just now'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    return `${hours}h ago`
  }

  const getStatusText = () => {
    if (isConnecting) return 'Connecting...'
    if (isConnected) return `Updated ${getLastUpdate() || 'recently'}`
    return 'Disconnected'
  }

  const getStatusIndicator = () => {
    if (isConnecting) return 'bg-yellow-500 animate-pulse'
    if (isConnected) return 'bg-green-500 animate-pulse'
    return 'bg-red-500'
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Live Crypto Prices</CardTitle>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${getStatusIndicator()}`} />
            <span className="text-xs text-muted-foreground">
              {getStatusText()}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {prices.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <div className="text-center">
              <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm">
                {isConnecting ? 'Connecting to real-time data...' : 'Loading price data...'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {prices.map((crypto) => {
              const isPositive = crypto.changePercent24h >= 0
              const isNeutral = crypto.changePercent24h === 0
              
              return (
                <div key={crypto.symbol} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary">
                        {crypto.symbol.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-medium">{crypto.symbol}</h4>
                      <p className="text-xs text-muted-foreground">
                        Vol: {formatVolume(crypto.volume24h)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-semibold">
                      ${formatPrice(crypto.price)}
                    </div>
                    <div className="flex items-center gap-1 justify-end">
                      {isNeutral ? (
                        <Minus className="w-3 h-3 text-muted-foreground" />
                      ) : isPositive ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                      <Badge 
                        variant={isNeutral ? 'secondary' : isPositive ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {isPositive && !isNeutral ? '+' : ''}{crypto.changePercent24h.toFixed(2)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
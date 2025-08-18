import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Activity, DollarSign } from '@phosphor-icons/react'
import { usePriceFeed } from '@/hooks/use-price-feed'

export default function MarketOverview() {
  const { prices } = usePriceFeed()

  // Calculate market metrics
  const btcPrice = prices.find(p => p.symbol === 'BTC')?.price || 0
  const ethPrice = prices.find(p => p.symbol === 'ETH')?.price || 0
  
  const totalVolume = prices.reduce((sum, crypto) => sum + crypto.volume24h, 0)
  const averageChange = prices.length > 0 
    ? prices.reduce((sum, crypto) => sum + crypto.changePercent24h, 0) / prices.length 
    : 0

  const gainers = prices.filter(p => p.changePercent24h > 0).length
  const losers = prices.filter(p => p.changePercent24h < 0).length

  const formatVolume = (volume: number): string => {
    if (volume >= 1000000000) {
      return `$${(volume / 1000000000).toFixed(1)}B`
    } else if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`
    }
    return `$${(volume / 1000).toFixed(1)}K`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Market Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* BTC Dominance */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Bitcoin</p>
            <p className="text-lg font-semibold">
              ${btcPrice.toLocaleString()}
            </p>
          </div>

          {/* ETH Price */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Ethereum</p>
            <p className="text-lg font-semibold">
              ${ethPrice.toLocaleString()}
            </p>
          </div>

          {/* Total Volume */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">24h Volume</p>
            <p className="text-lg font-semibold flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              {formatVolume(totalVolume)}
            </p>
          </div>

          {/* Average Change */}
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg Change</p>
            <p className={`text-lg font-semibold flex items-center gap-1 ${
              averageChange >= 0 ? 'text-green-500' : 'text-red-500'
            }`}>
              {averageChange >= 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              {averageChange >= 0 ? '+' : ''}{averageChange.toFixed(2)}%
            </p>
          </div>

          {/* Market Sentiment */}
          <div className="col-span-2 pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Market Sentiment</span>
              <div className="flex gap-4">
                <span className="text-green-500">↗ {gainers} up</span>
                <span className="text-red-500">↘ {losers} down</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
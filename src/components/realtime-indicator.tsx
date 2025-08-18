import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Wifi, WifiOff, ArrowClockwise, Activity, Zap } from '@phosphor-icons/react'
import { useWebSocket } from '@/hooks/use-websocket'

export default function RealTimeIndicator() {
  const { connectionStatus, isConnected, isConnecting, reconnect, prices } = useWebSocket()
  const [dataUpdates, setDataUpdates] = useState(0)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date | null>(null)

  // Track data updates
  useEffect(() => {
    if (prices.length > 0) {
      setDataUpdates(prev => prev + 1)
      setLastUpdateTime(new Date())
    }
  }, [prices])

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-500'
      case 'connecting': return 'text-yellow-500'
      case 'disconnected': return 'text-red-500'
      default: return 'text-gray-500'
    }
  }

  const getStatusIcon = () => {
    if (isConnecting) {
      return <ArrowClockwise className="w-4 h-4 animate-spin" />
    }
    return isConnected ? (
      <Wifi className="w-4 h-4" />
    ) : (
      <WifiOff className="w-4 h-4" />
    )
  }

  const formatLastUpdate = () => {
    if (!lastUpdateTime) return 'No updates yet'
    const seconds = Math.floor((Date.now() - lastUpdateTime.getTime()) / 1000)
    if (seconds < 5) return 'Just now'
    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ago`
  }

  return (
    <Card className="border-dashed">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`${getStatusColor()} flex items-center gap-2`}>
              {getStatusIcon()}
              <span className="text-sm font-medium">
                WebSocket {connectionStatus}
              </span>
            </div>
            
            {isConnected && (
              <Badge variant="secondary" className="gap-1">
                <Zap className="w-3 h-3" />
                Real-time
              </Badge>
            )}
          </div>

          {!isConnected && !isConnecting && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={reconnect}
              className="h-7 px-3 text-xs"
            >
              <ArrowClockwise className="w-3 h-3 mr-1" />
              Reconnect
            </Button>
          )}
        </div>

        {isConnected && (
          <div className="mt-3 pt-3 border-t border-dashed flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Activity className="w-3 h-3" />
                <span>{dataUpdates} updates</span>
              </div>
              <div>
                Last: {formatLastUpdate()}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span>Live</span>
            </div>
          </div>
        )}

        {connectionStatus === 'disconnected' && (
          <div className="mt-3 pt-3 border-t border-dashed">
            <p className="text-xs text-muted-foreground">
              Using cached data. Real-time updates are unavailable.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
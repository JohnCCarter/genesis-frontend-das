import { useWebSocket } from '@/hooks/use-websocket'
import { Badge } from '@/components/ui/badge'
import { Wifi, WifiOff, ArrowClockwise } from '@phosphor-icons/react'

export default function WebSocketStatus() {
  const { connectionStatus, isConnected, isConnecting } = useWebSocket()

  const getStatusVariant = () => {
    switch (connectionStatus) {
      case 'connected': return 'default'
      case 'connecting': return 'secondary'
      case 'disconnected': return 'destructive'
      default: return 'secondary'
    }
  }

  const getStatusIcon = () => {
    if (isConnecting) {
      return <ArrowClockwise className="w-3 h-3 animate-spin" />
    }
    return isConnected ? (
      <Wifi className="w-3 h-3" />
    ) : (
      <WifiOff className="w-3 h-3" />
    )
  }

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Live Data'
      case 'connecting': return 'Connecting'
      case 'disconnected': return 'Offline'
      default: return 'Unknown'
    }
  }

  return (
    <Badge variant={getStatusVariant()} className="gap-1">
      {getStatusIcon()}
      {getStatusText()}
    </Badge>
  )
}
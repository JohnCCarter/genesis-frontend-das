import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Wifi, WifiOff, ArrowClockwise, CheckCircle, XCircle } from '@phosphor-icons/react'
import { api, WSPoolStatus, UICapabilities } from '@/lib/api'
import { toast } from 'sonner'

export default function StatusCard() {
  const [status, setStatus] = useState<WSPoolStatus | null>(null)
  const [capabilities, setCapabilities] = useState<UICapabilities | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchStatus = async () => {
    try {
      const wsStatus = await api.getWSPoolStatus()
      setStatus(wsStatus)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Failed to fetch WS status:', error)
      // Don't show toast on every poll failure to avoid spam
    }
  }

  const fetchCapabilities = async () => {
    try {
      const caps = await api.getUICapabilities()
      setCapabilities(caps)
    } catch (error) {
      console.error('Failed to fetch capabilities:', error)
      toast.error('Failed to load capabilities')
    }
  }

  const refreshAll = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchStatus(), fetchCapabilities()])
    } finally {
      setIsLoading(false)
    }
  }

  // Initial load
  useEffect(() => {
    refreshAll()
  }, [])

  // Poll status every 5 seconds
  useEffect(() => {
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const getConnectionBadge = () => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>
    
    const isConnected = status.main.connected
    const isAuthenticated = status.main.authenticated
    
    if (isConnected && isAuthenticated) {
      return (
        <Badge variant="default" className="bg-green-600 hover:bg-green-700">
          <Wifi className="w-3 h-3 mr-1" />
          Connected & Auth
        </Badge>
      )
    } else if (isConnected) {
      return (
        <Badge variant="secondary" className="bg-yellow-600 hover:bg-yellow-700">
          <Wifi className="w-3 h-3 mr-1" />
          Connected
        </Badge>
      )
    } else {
      return (
        <Badge variant="destructive">
          <WifiOff className="w-3 h-3 mr-1" />
          Disconnected
        </Badge>
      )
    }
  }

  const getCapabilityBadge = (enabled: boolean, label: string) => {
    return (
      <Badge variant={enabled ? "default" : "secondary"} className="text-xs">
        {enabled ? (
          <CheckCircle className="w-3 h-3 mr-1" />
        ) : (
          <XCircle className="w-3 h-3 mr-1" />
        )}
        {label}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">System Status</CardTitle>
            <CardDescription>
              WebSocket connections and capabilities
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshAll}
            disabled={isLoading}
            className="h-8 w-8 p-0"
          >
            <ArrowClockwise 
              className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Connection</span>
            {getConnectionBadge()}
          </div>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </p>
          )}
        </div>

        <Separator />

        {/* Active Subscriptions */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Active Subscriptions</span>
          {status?.subscriptions && status.subscriptions.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {status.subscriptions.map((sub, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {sub}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No active subscriptions</p>
          )}
        </div>

        <Separator />

        {/* Capabilities */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Capabilities</span>
          {capabilities ? (
            <div className="flex flex-wrap gap-2">
              {getCapabilityBadge(capabilities.ws.strategy_enabled, 'WS Strategy')}
              {getCapabilityBadge(capabilities.prob, 'Probability')}
              {getCapabilityBadge(capabilities.dry_run, 'Dry Run')}
              {getCapabilityBadge(capabilities.rate_limit, 'Rate Limit')}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <ArrowClockwise className="w-3 h-3 animate-spin" />
              <span className="text-xs text-muted-foreground">Loading capabilities...</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
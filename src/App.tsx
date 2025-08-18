import { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Activity, TrendingUp, TrendingDown, Play, Pause, Settings, Wifi, WifiOff, ArrowClockwise } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import { useWebSocket } from '@/hooks/use-websocket'
import { Toaster, toast } from 'sonner'
import PerformanceChart from '@/components/performance-chart'
import TradesTable from '@/components/trades-table'
import MetricCard from '@/components/metric-card'
import BotControls from '@/components/bot-controls'
import ConfigurationPanel from '@/components/configuration-panel'
import PriceFeed from '@/components/price-feed'
import MarketOverview from '@/components/market-overview'
import RealTimeIndicator from '@/components/realtime-indicator'

function App() {
  const [botStatus, setBotStatus] = useKV('bot-status', 'paused')
  const { 
    tradingData, 
    connectionStatus, 
    isConnected, 
    isConnecting, 
    reconnect 
  } = useWebSocket()
  
  // Use WebSocket data if available, otherwise fall back to stored values
  const portfolioValue = tradingData?.portfolioValue ?? 125430.50
  const dailyPnL = tradingData?.dailyPnL ?? 2340.75
  const totalPnL = tradingData?.totalPnL ?? 23450.30
  const activePositions = tradingData?.activePositions ?? 7

  // Show connection status change notifications
  useEffect(() => {
    if (connectionStatus === 'connected') {
      toast.success('Real-time data connected', {
        description: 'Receiving live updates from WebSocket'
      })
    } else if (connectionStatus === 'disconnected') {
      toast.error('Connection lost', {
        description: 'Attempting to reconnect...'
      })
    }
  }, [connectionStatus])

  const getConnectionStatusText = () => {
    switch (connectionStatus) {
      case 'connected': return 'Connected'
      case 'connecting': return 'Connecting...'
      case 'disconnected': return 'Disconnected'
      default: return 'Unknown'
    }
  }

  const getConnectionIcon = () => {
    if (isConnecting) {
      return <ArrowClockwise className="w-5 h-5 text-yellow-500 animate-spin" />
    }
    return isConnected ? (
      <Wifi className="w-5 h-5 text-green-500" />
    ) : (
      <WifiOff className="w-5 h-5 text-red-500" />
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Trading Bot Dashboard</h1>
            <p className="text-muted-foreground">Monitor and control your automated trading</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getConnectionIcon()}
              <span className="text-sm">{getConnectionStatusText()}</span>
              {!isConnected && !isConnecting && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={reconnect}
                  className="h-6 px-2 text-xs"
                >
                  Retry
                </Button>
              )}
            </div>
            <Badge variant={botStatus === 'active' ? 'default' : 'secondary'} className="gap-2">
              {botStatus === 'active' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
              Bot {botStatus}
            </Badge>
          </div>
        </div>

        {/* Portfolio Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Portfolio Value"
            value={`$${portfolioValue.toLocaleString()}`}
            change={`+${((dailyPnL / portfolioValue) * 100).toFixed(2)}%`}
            trend={dailyPnL >= 0 ? 'up' : 'down'}
            icon={<Activity className="w-5 h-5" />}
          />
          <MetricCard
            title="Daily P&L"
            value={`${dailyPnL >= 0 ? '+' : ''}$${dailyPnL.toLocaleString()}`}
            change="vs yesterday"
            trend={dailyPnL >= 0 ? 'up' : 'down'}
            icon={dailyPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          />
          <MetricCard
            title="Total P&L"
            value={`${totalPnL >= 0 ? '+' : ''}$${totalPnL.toLocaleString()}`}
            change="all time"
            trend={totalPnL >= 0 ? 'up' : 'down'}
            icon={totalPnL >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          />
          <MetricCard
            title="Active Positions"
            value={activePositions.toString()}
            change="open trades"
            trend="neutral"
            icon={<Activity className="w-5 h-5" />}
          />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Chart</CardTitle>
                    <CardDescription>Portfolio value over time</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PerformanceChart />
                  </CardContent>
                </Card>
              </div>
              <div className="space-y-6">
                <BotControls 
                  status={botStatus} 
                  onStatusChange={setBotStatus}
                />
                <MarketOverview />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="markets" className="space-y-6">
            <RealTimeIndicator />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PriceFeed />
              <Card>
                <CardHeader>
                  <CardTitle>Price Alerts</CardTitle>
                  <CardDescription>Configure price movement notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    <p className="text-sm">Price alerts configuration coming soon</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Performance Analytics</CardTitle>
                <CardDescription>Detailed analysis of trading performance</CardDescription>
              </CardHeader>
              <CardContent>
                <PerformanceChart showDetailedAnalytics />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trades">
            <Card>
              <CardHeader>
                <CardTitle>Recent Trades</CardTitle>
                <CardDescription>Complete history of bot trades</CardDescription>
              </CardHeader>
              <CardContent>
                <TradesTable />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <ConfigurationPanel />
          </TabsContent>
        </Tabs>
      </div>
      <Toaster 
        theme="dark"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
    </div>
  )
}

export default App
import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Activity, TrendingUp, TrendingDown, Play, Pause, Settings, Wifi, WifiOff } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'
import PerformanceChart from '@/components/performance-chart'
import TradesTable from '@/components/trades-table'
import MetricCard from '@/components/metric-card'
import BotControls from '@/components/bot-controls'
import ConfigurationPanel from '@/components/configuration-panel'

function App() {
  const [botStatus, setBotStatus] = useKV('bot-status', 'paused')
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected')
  const [portfolioValue] = useKV('portfolio-value', 125430.50)
  const [dailyPnL] = useKV('daily-pnl', 2340.75)
  const [totalPnL] = useKV('total-pnl', 23450.30)
  const [activePositions] = useKV('active-positions', 7)

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
              {connectionStatus === 'connected' ? (
                <Wifi className="w-5 h-5 text-success" />
              ) : (
                <WifiOff className="w-5 h-5 text-destructive" />
              )}
              <span className="text-sm">{connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}</span>
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
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
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
              <div>
                <BotControls 
                  status={botStatus} 
                  onStatusChange={setBotStatus}
                />
              </div>
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
    </div>
  )
}

export default App
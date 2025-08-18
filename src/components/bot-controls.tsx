import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Play, Pause, Settings } from '@phosphor-icons/react'
import { useKV } from '@github/spark/hooks'

interface BotControlsProps {
  status: string
  onStatusChange: (status: string) => void
}

export default function BotControls({ status, onStatusChange }: BotControlsProps) {
  const [strategy] = useKV('current-strategy', 'Grid Trading')
  const [lastAction] = useKV('last-action', 'BUY BTCUSDT at $43,250')
  const [uptime] = useKV('bot-uptime', '2h 45m')
  const [totalTrades] = useKV('total-trades-today', 12)

  const handleToggleBot = () => {
    const newStatus = status === 'active' ? 'paused' : 'active'
    onStatusChange(newStatus)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Bot Control Panel
          <Badge variant={status === 'active' ? 'default' : 'secondary'}>
            {status === 'active' ? 'Running' : 'Stopped'}
          </Badge>
        </CardTitle>
        <CardDescription>
          Manage your trading bot operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Button 
            onClick={handleToggleBot}
            variant={status === 'active' ? 'destructive' : 'default'}
            className="flex-1"
          >
            {status === 'active' ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Stop Bot
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Bot
              </>
            )}
          </Button>
          <Button variant="outline" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        <Separator />

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-2">Current Strategy</h4>
            <p className="text-sm text-muted-foreground">{strategy}</p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Last Action</h4>
            <p className="text-sm text-muted-foreground">{lastAction}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium mb-1">Uptime</h4>
              <p className="text-lg font-semibold text-accent">{uptime}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-1">Trades Today</h4>
              <p className="text-lg font-semibold text-accent">{totalTrades}</p>
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <h4 className="text-sm font-medium">Quick Stats</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-secondary p-2 rounded">
              <span className="text-muted-foreground">Win Rate:</span>
              <span className="float-right text-success">74%</span>
            </div>
            <div className="bg-secondary p-2 rounded">
              <span className="text-muted-foreground">Avg Trade:</span>
              <span className="float-right">2.3m</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
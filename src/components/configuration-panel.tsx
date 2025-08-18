import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useState } from 'react'
import { useKV } from '@github/spark/hooks'
import { toast } from 'sonner'

export default function ConfigurationPanel() {
  const [apiKey, setApiKey] = useKV('api-key', '')
  const [apiSecret, setApiSecret] = useKV('api-secret', '')
  const [strategy, setStrategy] = useKV('strategy', 'grid-trading')
  const [riskLevel, setRiskLevel] = useKV('risk-level', 'medium')
  const [maxPositions, setMaxPositions] = useKV('max-positions', '5')
  const [stopLoss, setStopLoss] = useKV('stop-loss', '2.0')
  const [takeProfit, setTakeProfit] = useKV('take-profit', '5.0')
  const [autoRebalance, setAutoRebalance] = useKV('auto-rebalance', true)
  const [telegramNotifications, setTelegramNotifications] = useKV('telegram-notifications', false)
  
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    toast.success('Configuration saved successfully!')
  }

  const handleTestConnection = async () => {
    setIsLoading(true)
    // Simulate API test
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
    toast.success('API connection test successful!')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Configure your exchange API credentials
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="api-secret">API Secret</Label>
            <Input
              id="api-secret"
              type="password"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              placeholder="Enter your API secret"
            />
          </div>
          <Button 
            onClick={handleTestConnection} 
            variant="outline" 
            disabled={isLoading}
            className="w-full"
          >
            Test Connection
          </Button>
        </CardContent>
      </Card>

      {/* Trading Strategy */}
      <Card>
        <CardHeader>
          <CardTitle>Trading Strategy</CardTitle>
          <CardDescription>
            Select and configure your trading strategy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="strategy">Strategy Type</Label>
            <Select value={strategy} onValueChange={setStrategy}>
              <SelectTrigger id="strategy">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid-trading">Grid Trading</SelectItem>
                <SelectItem value="dca">Dollar Cost Averaging</SelectItem>
                <SelectItem value="momentum">Momentum Trading</SelectItem>
                <SelectItem value="arbitrage">Arbitrage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="risk-level">Risk Level</Label>
            <Select value={riskLevel} onValueChange={setRiskLevel}>
              <SelectTrigger id="risk-level">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Risk Management */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Management</CardTitle>
          <CardDescription>
            Configure risk parameters and limits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="max-positions">Max Positions</Label>
            <Input
              id="max-positions"
              type="number"
              value={maxPositions}
              onChange={(e) => setMaxPositions(e.target.value)}
              min="1"
              max="20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stop-loss">Stop Loss (%)</Label>
            <Input
              id="stop-loss"
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              step="0.1"
              min="0.1"
              max="10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="take-profit">Take Profit (%)</Label>
            <Input
              id="take-profit"
              type="number"
              value={takeProfit}
              onChange={(e) => setTakeProfit(e.target.value)}
              step="0.1"
              min="0.1"
              max="50"
            />
          </div>
        </CardContent>
      </Card>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>
            Additional bot configuration options
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-rebalance">Auto Rebalance</Label>
              <p className="text-sm text-muted-foreground">
                Automatically rebalance portfolio
              </p>
            </div>
            <Switch
              id="auto-rebalance"
              checked={autoRebalance}
              onCheckedChange={setAutoRebalance}
            />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="telegram-notifications">Telegram Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Send trade alerts to Telegram
              </p>
            </div>
            <Switch
              id="telegram-notifications"
              checked={telegramNotifications}
              onCheckedChange={setTelegramNotifications}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="lg:col-span-2">
        <Button 
          onClick={handleSave} 
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  )
}
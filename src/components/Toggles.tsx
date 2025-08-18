import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { ArrowClockwise } from '@phosphor-icons/react'
import { api, UICapabilities } from '@/lib/api'
import { toast } from 'sonner'

export default function Toggles() {
  const [wsStrategyEnabled, setWSStrategyEnabled] = useState(false)
  const [validationEnabled, setValidationEnabled] = useState(false)
  const [isWSStrategyLoading, setIsWSStrategyLoading] = useState(false)
  const [isValidationLoading, setIsValidationLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchCapabilities = async () => {
    setIsRefreshing(true)
    try {
      const capabilities = await api.getUICapabilities()
      setWSStrategyEnabled(capabilities.ws.strategy_enabled)
      // Note: validation_on_start status needs to be tracked separately or included in capabilities
    } catch (error) {
      console.error('Failed to fetch capabilities:', error)
      toast.error('Failed to load current settings')
    } finally {
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchCapabilities()
  }, [])

  const handleWSStrategyToggle = async (enabled: boolean) => {
    setIsWSStrategyLoading(true)
    try {
      const response = await api.setWSStrategy(enabled)
      if (response.ok) {
        setWSStrategyEnabled(enabled)
        toast.success(
          `WS Strategy ${enabled ? 'enabled' : 'disabled'}`, 
          {
            description: enabled 
              ? 'Bot will now use WebSocket strategy'
              : 'Bot switched to standard mode'
          }
        )
      } else {
        toast.error('Failed to update WS Strategy')
        // Revert the switch position
        setWSStrategyEnabled(!enabled)
      }
    } catch (error) {
      console.error('Failed to toggle WS strategy:', error)
      toast.error('Failed to update WS Strategy', {
        description: 'Please check your connection and try again'
      })
      // Revert the switch position
      setWSStrategyEnabled(!enabled)
    } finally {
      setIsWSStrategyLoading(false)
    }
  }

  const handleValidationToggle = async (enabled: boolean) => {
    setIsValidationLoading(true)
    try {
      const response = await api.setValidationWarmup(enabled)
      if (response.ok) {
        setValidationEnabled(enabled)
        toast.success(
          `Validation warmup ${enabled ? 'enabled' : 'disabled'}`,
          {
            description: enabled
              ? 'Bot will run validation on startup'
              : 'Bot will skip validation warmup'
          }
        )
      } else {
        toast.error('Failed to update validation setting')
        // Revert the switch position
        setValidationEnabled(!enabled)
      }
    } catch (error) {
      console.error('Failed to toggle validation:', error)
      toast.error('Failed to update validation setting', {
        description: 'Please check your connection and try again'
      })
      // Revert the switch position
      setValidationEnabled(!enabled)
    } finally {
      setIsValidationLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Bot Configuration</CardTitle>
            <CardDescription>
              Control bot behavior and strategy modes
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchCapabilities}
            disabled={isRefreshing}
            className="h-8 w-8 p-0"
          >
            <ArrowClockwise 
              className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} 
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* WebSocket Strategy Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label 
              htmlFor="ws-strategy" 
              className="text-sm font-medium cursor-pointer"
            >
              WebSocket Strategy
            </Label>
            <p className="text-xs text-muted-foreground">
              Enable real-time WebSocket-based trading strategy
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isWSStrategyLoading && (
              <ArrowClockwise className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
            <Switch
              id="ws-strategy"
              checked={wsStrategyEnabled}
              onCheckedChange={handleWSStrategyToggle}
              disabled={isWSStrategyLoading}
            />
          </div>
        </div>

        {/* Validation Warmup Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label 
              htmlFor="validation-warmup" 
              className="text-sm font-medium cursor-pointer"
            >
              Validation Warmup
            </Label>
            <p className="text-xs text-muted-foreground">
              Run probability validation when bot starts
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isValidationLoading && (
              <ArrowClockwise className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
            <Switch
              id="validation-warmup"
              checked={validationEnabled}
              onCheckedChange={handleValidationToggle}
              disabled={isValidationLoading}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
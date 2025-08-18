import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ArrowClockwise, Play, CheckCircle, XCircle } from '@phosphor-icons/react'
import { api, ValidationRequest } from '@/lib/api'
import { toast } from 'sonner'

const DEFAULT_SYMBOLS = ['tBTCUSD', 'tETHUSD', 'tTESTBTC', 'tTESTETH']
const TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1D']

export default function ValidationPanel() {
  const [selectedSymbols, setSelectedSymbols] = useState<string[]>(['tBTCUSD'])
  const [timeframe, setTimeframe] = useState('1h')
  const [limit, setLimit] = useState('100')
  const [maxSamples, setMaxSamples] = useState('50')
  const [isRunning, setIsRunning] = useState(false)
  const [validationResult, setValidationResult] = useState<any>(null)
  const [lastRunTime, setLastRunTime] = useState<Date | null>(null)

  const toggleSymbol = (symbol: string) => {
    setSelectedSymbols(prev => 
      prev.includes(symbol) 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    )
  }

  const runValidation = async () => {
    if (selectedSymbols.length === 0) {
      toast.error('Please select at least one symbol')
      return
    }

    setIsRunning(true)
    setValidationResult(null)

    try {
      const params: ValidationRequest = {
        symbols: selectedSymbols,
        timeframe,
        ...(limit && { limit: parseInt(limit) }),
        ...(maxSamples && { max_samples: parseInt(maxSamples) })
      }

      const result = await api.runValidation(params)
      setValidationResult(result)
      setLastRunTime(new Date())

      toast.success('Validation completed', {
        description: `Analyzed ${selectedSymbols.length} symbol(s) on ${timeframe} timeframe`
      })
    } catch (error) {
      console.error('Validation failed:', error)
      toast.error('Validation failed', {
        description: 'Please check your parameters and try again'
      })
    } finally {
      setIsRunning(false)
    }
  }

  const clearResults = () => {
    setValidationResult(null)
    setLastRunTime(null)
  }

  const getResultSummary = () => {
    if (!validationResult) return null

    // Try to extract meaningful summary from the result
    // This will depend on the actual structure of your validation response
    if (typeof validationResult === 'object') {
      const keys = Object.keys(validationResult)
      const hasErrors = validationResult.error || validationResult.errors
      const hasSuccess = validationResult.success !== false
      
      return {
        status: hasErrors ? 'error' : hasSuccess ? 'success' : 'info',
        symbolCount: selectedSymbols.length,
        timeframe,
        timestamp: lastRunTime
      }
    }

    return {
      status: 'info',
      symbolCount: selectedSymbols.length,
      timeframe,
      timestamp: lastRunTime
    }
  }

  const resultSummary = getResultSummary()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Probability Validation</CardTitle>
        <CardDescription>
          Run validation analysis on trading strategies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Symbol Selection */}
        <div className="space-y-2">
          <Label>Symbols</Label>
          <div className="flex flex-wrap gap-2">
            {DEFAULT_SYMBOLS.map((symbol) => (
              <Button
                key={symbol}
                variant={selectedSymbols.includes(symbol) ? 'default' : 'outline'}
                size="sm"
                onClick={() => toggleSymbol(symbol)}
                className="text-xs"
              >
                {symbol}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Selected: {selectedSymbols.length} symbol(s)
          </p>
        </div>

        {/* Timeframe Selection */}
        <div className="space-y-2">
          <Label htmlFor="timeframe">Timeframe</Label>
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger>
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              {TIMEFRAMES.map((tf) => (
                <SelectItem key={tf} value={tf}>
                  {tf}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Limit Input */}
        <div className="space-y-2">
          <Label htmlFor="limit">Limit (optional)</Label>
          <Input
            id="limit"
            type="number"
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            placeholder="100"
          />
        </div>

        {/* Max Samples Input */}
        <div className="space-y-2">
          <Label htmlFor="maxSamples">Max Samples (optional)</Label>
          <Input
            id="maxSamples"
            type="number"
            value={maxSamples}
            onChange={(e) => setMaxSamples(e.target.value)}
            placeholder="50"
          />
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={runValidation}
            disabled={isRunning || selectedSymbols.length === 0}
            className="flex-1"
          >
            {isRunning ? (
              <ArrowClockwise className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Run Validation
          </Button>
          {validationResult && (
            <Button
              variant="outline"
              onClick={clearResults}
              className="flex-1"
            >
              Clear Results
            </Button>
          )}
        </div>

        {/* Result Summary */}
        {resultSummary && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Run</span>
              <div className="flex items-center gap-2">
                {resultSummary.status === 'success' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                {resultSummary.status === 'error' && (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <Badge variant="outline" className="text-xs">
                  {resultSummary.symbolCount} symbols • {resultSummary.timeframe}
                </Badge>
              </div>
            </div>
            {resultSummary.timestamp && (
              <p className="text-xs text-muted-foreground">
                Completed: {resultSummary.timestamp.toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Validation Results */}
        {validationResult && (
          <div className="space-y-2">
            <Label>Validation Results</Label>
            <div className="bg-muted p-3 rounded-md max-h-96 overflow-auto">
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(validationResult, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Running Indicator */}
        {isRunning && (
          <div className="flex items-center justify-center p-4 bg-muted rounded-md">
            <ArrowClockwise className="w-5 h-5 mr-2 animate-spin" />
            <span className="text-sm">Running validation...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
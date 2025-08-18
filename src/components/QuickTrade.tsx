import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ArrowClockwise, TrendingUp, TrendingDown } from '@phosphor-icons/react'
import { api, TickerData, OrderRequest, OrderResponse } from '@/lib/api'
import { toast } from 'sonner'

const DEFAULT_SYMBOLS = ['tBTCUSD', 'tETHUSD', 'tTESTBTC', 'tTESTETH']

export default function QuickTrade() {
  const [symbol, setSymbol] = useState(() => 
    localStorage.getItem('quicktrade_symbol') || 'tBTCUSD'
  )
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY')
  const [amount, setAmount] = useState(() => 
    localStorage.getItem('quicktrade_amount') || '0.01'
  )
  const [price, setPrice] = useState(() => 
    localStorage.getItem('quicktrade_price') || ''
  )
  const [tickerData, setTickerData] = useState<TickerData | null>(null)
  const [isLoadingTicker, setIsLoadingTicker] = useState(false)
  const [isTrading, setIsTrading] = useState(false)
  const [lastOrderResponse, setLastOrderResponse] = useState<OrderResponse | null>(null)

  // Persist form values to localStorage
  useEffect(() => {
    localStorage.setItem('quicktrade_symbol', symbol)
  }, [symbol])

  useEffect(() => {
    localStorage.setItem('quicktrade_amount', amount)
  }, [amount])

  useEffect(() => {
    localStorage.setItem('quicktrade_price', price)
  }, [price])

  const fetchTicker = async () => {
    if (!symbol) return
    
    setIsLoadingTicker(true)
    try {
      const ticker = await api.getTicker(symbol)
      setTickerData(ticker)
    } catch (error) {
      console.error('Failed to fetch ticker:', error)
      toast.error('Failed to load market data', {
        description: 'Please check the symbol and try again'
      })
    } finally {
      setIsLoadingTicker(false)
    }
  }

  const calculatePreview = () => {
    if (!tickerData || !amount) return null

    const amountNum = parseFloat(amount)
    const priceNum = price ? parseFloat(price) : (side === 'BUY' ? tickerData.ask : tickerData.bid)
    
    if (isNaN(amountNum) || isNaN(priceNum)) return null

    const notional = Math.abs(amountNum * priceNum)
    const estimatedFee = notional * 0.0002 // 0.02% fee estimate

    return {
      notional,
      estimatedFee,
      effectivePrice: priceNum
    }
  }

  const handlePreview = () => {
    fetchTicker()
  }

  const handleTrade = async () => {
    if (!symbol || !amount) {
      toast.error('Please fill in all required fields')
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum === 0) {
      toast.error('Please enter a valid amount')
      return
    }

    setIsTrading(true)
    try {
      const orderRequest: OrderRequest = {
        symbol,
        amount: side === 'SELL' ? -Math.abs(amountNum) : Math.abs(amountNum),
        type: price ? 'EXCHANGE LIMIT' : 'EXCHANGE MARKET',
        ...(price && { price: parseFloat(price) })
      }

      const response = await api.createOrder(orderRequest)
      setLastOrderResponse(response)

      if (response.success) {
        toast.success('Order placed successfully', {
          description: `${side} ${Math.abs(amountNum)} ${symbol}`
        })
      } else {
        toast.error('Order failed', {
          description: response.error || 'Unknown error occurred'
        })
      }
    } catch (error) {
      console.error('Failed to place order:', error)
      toast.error('Failed to place order', {
        description: 'Please check your connection and try again'
      })
    } finally {
      setIsTrading(false)
    }
  }

  const preview = calculatePreview()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Quick Trade</CardTitle>
        <CardDescription>
          Execute manual trades with market preview
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Symbol Selection */}
        <div className="space-y-2">
          <Label htmlFor="symbol">Symbol</Label>
          <Select value={symbol} onValueChange={setSymbol}>
            <SelectTrigger>
              <SelectValue placeholder="Select symbol" />
            </SelectTrigger>
            <SelectContent>
              {DEFAULT_SYMBOLS.map((sym) => (
                <SelectItem key={sym} value={sym}>
                  {sym}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Side Selection */}
        <div className="space-y-2">
          <Label>Side</Label>
          <div className="flex gap-2">
            <Button
              variant={side === 'BUY' ? 'default' : 'outline'}
              onClick={() => setSide('BUY')}
              className="flex-1"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              BUY
            </Button>
            <Button
              variant={side === 'SELL' ? 'destructive' : 'outline'}
              onClick={() => setSide('SELL')}
              className="flex-1"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              SELL
            </Button>
          </div>
        </div>

        {/* Amount Input */}
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.00001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.01"
          />
        </div>

        {/* Price Input (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="price">Price (leave empty for market order)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Market price"
          />
        </div>

        {/* Market Data Preview */}
        {tickerData && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Last Price:</span>
              <span className="font-mono">${tickerData.last_price.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Bid:</span>
              <span className="font-mono text-red-500">${tickerData.bid.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Ask:</span>
              <span className="font-mono text-green-500">${tickerData.ask.toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Trade Preview */}
        {preview && (
          <div className="space-y-2 p-3 bg-muted rounded-md">
            <div className="flex justify-between text-sm">
              <span>Notional:</span>
              <span className="font-mono">${preview.notional.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Est. Fee:</span>
              <span className="font-mono">${preview.estimatedFee.toFixed(4)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Effective Price:</span>
              <span className="font-mono">${preview.effectivePrice.toFixed(2)}</span>
            </div>
          </div>
        )}

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={isLoadingTicker}
            className="flex-1"
          >
            {isLoadingTicker ? (
              <ArrowClockwise className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              'Preview'
            )}
          </Button>
          <Button
            onClick={handleTrade}
            disabled={isTrading || !symbol || !amount}
            className={`flex-1 ${side === 'SELL' ? 'bg-destructive hover:bg-destructive/90' : ''}`}
          >
            {isTrading ? (
              <ArrowClockwise className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              `${side} ${price ? 'LIMIT' : 'MARKET'}`
            )}
          </Button>
        </div>

        {/* Last Order Response */}
        {lastOrderResponse && (
          <div className="space-y-2">
            <Label>Last Order Response</Label>
            <div className="bg-muted p-3 rounded-md">
              <pre className="text-xs overflow-auto">
                {JSON.stringify(lastOrderResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
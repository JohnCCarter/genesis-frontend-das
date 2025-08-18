import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useKV } from '@github/spark/hooks'
import { TrendingUp, TrendingDown } from '@phosphor-icons/react'

interface Trade {
  id: string
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  entryPrice: number
  exitPrice?: number
  pnl: number
  status: 'open' | 'closed'
  timestamp: string
}

export default function TradesTable() {
  const [trades] = useKV<Trade[]>('recent-trades', [
    {
      id: '1',
      symbol: 'BTCUSDT',
      side: 'buy',
      quantity: 0.15,
      entryPrice: 43250,
      exitPrice: 43890,
      pnl: 96.00,
      status: 'closed',
      timestamp: '2024-01-15 14:32:15'
    },
    {
      id: '2',
      symbol: 'ETHUSDT',
      side: 'buy',
      quantity: 2.5,
      entryPrice: 2650,
      exitPrice: 2720,
      pnl: 175.00,
      status: 'closed',
      timestamp: '2024-01-15 13:45:22'
    },
    {
      id: '3',
      symbol: 'ADAUSDT',
      side: 'sell',
      quantity: 1000,
      entryPrice: 0.485,
      exitPrice: 0.462,
      pnl: -23.00,
      status: 'closed',
      timestamp: '2024-01-15 12:18:45'
    },
    {
      id: '4',
      symbol: 'SOLUSDT',
      side: 'buy',
      quantity: 5,
      entryPrice: 98.50,
      status: 'open',
      pnl: 45.50,
      timestamp: '2024-01-15 11:22:10'
    },
    {
      id: '5',
      symbol: 'DOTUSDT',
      side: 'buy',
      quantity: 25,
      entryPrice: 7.25,
      exitPrice: 7.89,
      pnl: 16.00,
      status: 'closed',
      timestamp: '2024-01-15 10:55:33'
    }
  ])

  const formatPrice = (price: number) => `$${price.toLocaleString()}`
  const formatPnL = (pnl: number) => `${pnl >= 0 ? '+' : ''}$${pnl.toFixed(2)}`

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Symbol</TableHead>
            <TableHead>Side</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Entry Price</TableHead>
            <TableHead>Exit Price</TableHead>
            <TableHead>P&L</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {trades.map((trade) => (
            <TableRow key={trade.id}>
              <TableCell className="font-medium">{trade.symbol}</TableCell>
              <TableCell>
                <Badge variant={trade.side === 'buy' ? 'default' : 'secondary'}>
                  {trade.side.toUpperCase()}
                </Badge>
              </TableCell>
              <TableCell>{trade.quantity}</TableCell>
              <TableCell>{formatPrice(trade.entryPrice)}</TableCell>
              <TableCell>
                {trade.exitPrice ? formatPrice(trade.exitPrice) : '-'}
              </TableCell>
              <TableCell>
                <div className={`flex items-center gap-1 ${
                  trade.pnl >= 0 ? 'text-success' : 'text-destructive'
                }`}>
                  {trade.pnl >= 0 ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {formatPnL(trade.pnl)}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={trade.status === 'open' ? 'destructive' : 'default'}>
                  {trade.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {new Date(trade.timestamp).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
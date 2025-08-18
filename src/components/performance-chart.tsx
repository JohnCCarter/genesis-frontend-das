import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useKV } from '@github/spark/hooks'

interface PerformanceChartProps {
  showDetailedAnalytics?: boolean
}

export default function PerformanceChart({ showDetailedAnalytics = false }: PerformanceChartProps) {
  const [chartData] = useKV('performance-data', [
    { time: '09:00', value: 123000, pnl: 0 },
    { time: '10:00', value: 123500, pnl: 500 },
    { time: '11:00', value: 124200, pnl: 1200 },
    { time: '12:00', value: 123800, pnl: 800 },
    { time: '13:00', value: 125100, pnl: 2100 },
    { time: '14:00', value: 124700, pnl: 1700 },
    { time: '15:00', value: 125400, pnl: 2400 },
    { time: '16:00', value: 125430, pnl: 2430 }
  ])

  const formatValue = (value: number) => `$${(value / 1000).toFixed(0)}k`
  const formatPnL = (value: number) => `${value >= 0 ? '+' : ''}$${value}`

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="time" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickFormatter={formatValue}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
              color: 'hsl(var(--card-foreground))'
            }}
            formatter={(value: number, name: string) => [
              name === 'value' ? formatValue(value) : formatPnL(value),
              name === 'value' ? 'Portfolio Value' : 'P&L'
            ]}
          />
          <Line
            type="monotone"
            dataKey="value"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: 'hsl(var(--accent))' }}
          />
          {showDetailedAnalytics && (
            <Line
              type="monotone"
              dataKey="pnl"
              stroke="hsl(var(--success))"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
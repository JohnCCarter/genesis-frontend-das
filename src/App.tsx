import { useEffect } from 'react'
import { Toaster, toast } from 'sonner'
import { api } from '@/lib/api'
import Dashboard from '@/pages/Dashboard'

function App() {
  // Initialize authentication on app start
  useEffect(() => {
    const initAuth = async () => {
      try {
        await api.getToken()
        toast.success('Connected to trading bot', {
          description: 'API authentication successful'
        })
      } catch (error) {
        console.error('Failed to initialize authentication:', error)
        toast.error('Authentication failed', {
          description: 'Check your connection to the trading bot API'
        })
      }
    }

    initAuth()
  }, [])

  return (
    <div className="min-h-screen">
      <Dashboard />
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import StatusCard from '@/components/StatusCard'
import Toggles from '@/components/Toggles'
import QuickTrade from '@/components/QuickTrade'
import ValidationPanel from '@/components/ValidationPanel'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-background text-foreground p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Trading Bot Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and control your automated trading system
          </p>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="trade">Quick Trade</TabsTrigger>
            <TabsTrigger value="validation">Validation</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <StatusCard />
              <Toggles />
            </div>
            
            {/* Additional Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Health</CardTitle>
                  <CardDescription>Overall system status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-2xl font-bold text-green-500 mb-2">Operational</div>
                    <p className="text-sm text-muted-foreground">All systems running normally</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">API Status</CardTitle>
                  <CardDescription>Backend connectivity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-2xl font-bold text-blue-500 mb-2">Connected</div>
                    <p className="text-sm text-muted-foreground">
                      {import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Environment</CardTitle>
                  <CardDescription>Current configuration</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <div className="text-2xl font-bold text-purple-500 mb-2">
                      {import.meta.env.DEV ? 'Development' : 'Production'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Build mode: {import.meta.env.MODE}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Quick Trade Tab */}
          <TabsContent value="trade" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuickTrade />
              
              {/* Trade History Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Orders</CardTitle>
                  <CardDescription>Your latest trading activity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">No recent orders</p>
                    <p className="text-xs mt-1">Orders will appear here after execution</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Validation Tab */}
          <TabsContent value="validation" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ValidationPanel />
              
              {/* Validation History Placeholder */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Validation History</CardTitle>
                  <CardDescription>Previous validation runs</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">No validation history</p>
                    <p className="text-xs mt-1">Results will be saved here</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Toggles />
              
              {/* Additional Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">API Configuration</CardTitle>
                  <CardDescription>Backend connection settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">API Base URL</label>
                    <div className="p-3 bg-muted rounded-md font-mono text-sm">
                      {import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Set VITE_API_BASE environment variable to change
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Authentication</label>
                    <div className="p-3 bg-muted rounded-md">
                      <div className="flex items-center justify-between text-sm">
                        <span>JWT Token</span>
                        <span className={localStorage.getItem('jwt') ? 'text-green-500' : 'text-red-500'}>
                          {localStorage.getItem('jwt') ? 'Active' : 'Not Set'}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
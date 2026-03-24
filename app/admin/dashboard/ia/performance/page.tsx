// app/admin/dashboard/ia/performance/page.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, TrendingUp, Clock, Zap } from "lucide-react"
import { useState } from "react"

export default function IaPerformancePage() {
  const [isLoading, setIsLoading] = useState(false)

  const loadData = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 1000)
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light">Performance IA</h1>
        <Button variant="outline" size="sm" onClick={loadData} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Rafraîchir
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              Temps de réponse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light">47ms</p>
            <p className="text-xs text-green-600 mt-1">-12% vs hier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              Requêtes/minute
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light">1,284</p>
            <p className="text-xs text-green-600 mt-1">+8% vs hier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              Uptime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light">99.97%</p>
            <p className="text-xs text-muted-foreground mt-1">30 derniers jours</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
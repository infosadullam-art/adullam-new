// app/admin/dashboard/ia/coldstart/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { dashboardApi } from "@/lib/admin/api-client"
import { Users, RefreshCw, TrendingUp } from "lucide-react"

export default function IaColdStartPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await dashboardApi.getColdStartMetrics()
      if (res.success) setData(res.data)
    } catch (error) {
      console.error("Erreur chargement cold start:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light">Cold Start</h1>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Rafraîchir
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nouveaux utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-light">{data?.newUsers || 0}</p>
            <p className="text-sm text-muted-foreground mt-2">CTR: {data?.avgCtr}%</p>
            <p className="text-sm text-muted-foreground">Conversion: {data?.conversionRate}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Utilisateurs connus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-light">{data?.knownUsers || 0}</p>
            <p className="text-sm text-muted-foreground mt-2">CTR: {data?.knownCtr}%</p>
            <p className="text-sm text-muted-foreground">Conversion: {data?.knownConversion}%</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Progression cold start</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">CTR nouveaux vs connus</span>
                <span className="text-sm font-medium">
                  {((data?.avgCtr / data?.knownCtr) * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={(data?.avgCtr / data?.knownCtr) * 100} className="h-2" />
              
              <div className="flex justify-between mt-4">
                <span className="text-sm">Utilisateurs passés en phase 2</span>
                <span className="text-sm font-medium">{data?.progression || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
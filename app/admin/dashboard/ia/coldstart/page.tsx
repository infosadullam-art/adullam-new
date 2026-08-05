// app/admin/dashboard/ia/coldstart/page.tsx

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { dashboardApi } from "@/lib/admin/api-client"
import { Users, RefreshCw, TrendingUp, UserPlus } from "lucide-react"

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
        <h1 className="text-2xl font-light flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-blue-500" />
          Cold Start
        </h1>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Rafraîchir
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Nouveaux utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nouveaux utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-light">{data?.newUsers || 0}</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CTR</span>
                <span className="font-medium">{data?.avgCtr || 0}%</span>
              </div>
              <Progress value={(data?.avgCtr || 0) * 5} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Conversion</span>
                <span className="font-medium">{data?.conversionRate || 0}%</span>
              </div>
              <Progress value={(data?.conversionRate || 0) * 10} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Utilisateurs connus */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Utilisateurs connus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-light">{data?.knownUsers || 0}</p>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">CTR</span>
                <span className="font-medium">{data?.knownCtr || 0}%</span>
              </div>
              <Progress value={(data?.knownCtr || 0) * 5} className="h-2" />
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Conversion</span>
                <span className="font-medium">{data?.knownConversion || 0}%</span>
              </div>
              <Progress value={(data?.knownConversion || 0) * 10} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Progression cold start */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Progression cold start</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">CTR nouveaux vs connus</p>
                <p className="text-2xl font-light">
                  {data?.avgCtr && data?.knownCtr 
                    ? ((data.avgCtr / data.knownCtr) * 100).toFixed(1) 
                    : 0}%
                </p>
                <Progress 
                  value={data?.avgCtr && data?.knownCtr 
                    ? (data.avgCtr / data.knownCtr) * 100 
                    : 0
                  } 
                  className="h-2 mt-2" 
                />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs passés en phase 2</p>
                <p className="text-2xl font-light">{data?.progression || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taux d'engagement</p>
                <p className="text-2xl font-light">{data?.engagementRate || 0}%</p>
                <Progress value={data?.engagementRate || 0} className="h-2 mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
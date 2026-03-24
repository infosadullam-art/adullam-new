// app/admin/dashboard/ia/quality/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { dashboardApi } from "@/lib/admin/api-client"
import { Target, RefreshCw, TrendingUp } from "lucide-react"

export default function IaQualityPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await dashboardApi.getQualityMetrics()
      if (res.success) setData(res.data)
    } catch (error) {
      console.error("Erreur chargement qualité:", error)
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
        <h1 className="text-2xl font-light">Qualité des recommandations</h1>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Rafraîchir
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Taux de clic (CTR)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Prédictions</span>
                <span className="font-medium">{data?.ctr?.prediction}%</span>
              </div>
              <Progress value={data?.ctr?.prediction * 5} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Diversité</span>
                <span className="font-medium">{data?.ctr?.diversity}%</span>
              </div>
              <Progress value={data?.ctr?.diversity * 5} className="h-2" />
            </div>
            <div className="pt-2 border-t">
              <div className="flex justify-between font-medium">
                <span>Global</span>
                <span>{data?.ctr?.overall}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Prédictions</span>
                <span className="font-medium">{data?.conversion?.prediction}%</span>
              </div>
              <Progress value={data?.conversion?.prediction * 10} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Diversité</span>
                <span className="font-medium">{data?.conversion?.diversity}%</span>
              </div>
              <Progress value={data?.conversion?.diversity * 10} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Diversité → Prédiction</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-light">{data?.diversityToPrediction?.clicked || 0}</p>
                <p className="text-xs text-muted-foreground">Clics diversité</p>
              </div>
              <div>
                <p className="text-2xl font-light">{data?.diversityToPrediction?.converted || 0}</p>
                <p className="text-xs text-muted-foreground">Devenus prédictions</p>
              </div>
              <div>
                <p className="text-2xl font-light">{data?.diversityToPrediction?.rate || 0}%</p>
                <p className="text-xs text-muted-foreground">Taux d'adoption</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
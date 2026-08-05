// app/admin/dashboard/ia/scroll/page.tsx

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { dashboardApi } from "@/lib/admin/api-client"
import { ScrollText, RefreshCw, TrendingUp, Users } from "lucide-react"

export default function IaScrollPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await dashboardApi.getScrollMetrics()
      if (res.success) setData(res.data)
    } catch (error) {
      console.error("Erreur chargement scroll:", error)
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
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light flex items-center gap-2">
          <ScrollText className="h-6 w-6 text-teal-500" />
          Scroll Infini
        </h1>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Rafraîchir
        </Button>
      </div>

      {/* Stats rapides */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profondeur moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light">{data?.avgDepth || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">pages par session</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Record</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light">{data?.record || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">pages maximum</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Produits vus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light">{data?.uniqueProductsSeen || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">sur {data?.totalProducts || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribution des sessions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Vont jusqu'à page 5</span>
                <span className="font-medium">{data?.distribution?.page5 || 0}%</span>
              </div>
              <Progress value={data?.distribution?.page5 || 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Vont jusqu'à page 10</span>
                <span className="font-medium">{data?.distribution?.page10 || 0}%</span>
              </div>
              <Progress value={data?.distribution?.page10 || 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Vont au-delà page 20</span>
                <span className="font-medium">{data?.distribution?.page20 || 0}%</span>
              </div>
              <Progress value={data?.distribution?.page20 || 0} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progression */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Couverture catalogue</p>
              <p className="text-2xl font-light">{data?.coveragePercent || 0}%</p>
              <Progress value={data?.coveragePercent || 0} className="h-2 mt-2" />
              <p className="text-xs text-muted-foreground mt-1">+{data?.dailyProgress || 0}% / jour</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pages restantes</p>
              <p className="text-2xl font-light">{data?.pagesRemaining || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">à découvrir</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Sessions actives</p>
              <p className="text-2xl font-light">{data?.activeSessions || 0}</p>
              <p className="text-xs text-muted-foreground mt-1">en ce moment</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
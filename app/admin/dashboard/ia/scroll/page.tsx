// app/admin/dashboard/ia/scroll/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { dashboardApi } from "@/lib/admin/api-client"
import { ScrollText, RefreshCw } from "lucide-react"

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
        <h1 className="text-2xl font-light">Scroll Infini</h1>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Rafraîchir
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Profondeur moyenne</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light">{data?.avgDepth}</p>
            <p className="text-xs text-muted-foreground mt-1">pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Record</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light">{data?.record}</p>
            <p className="text-xs text-muted-foreground mt-1">pages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Produits vus</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-light">{data?.uniqueProductsSeen}</p>
            <p className="text-xs text-muted-foreground mt-1">sur {data?.totalProducts}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Vont jusqu'à page 5</span>
                <span>{data?.distribution?.page5}%</span>
              </div>
              <Progress value={data?.distribution?.page5} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Vont jusqu'à page 10</span>
                <span>{data?.distribution?.page10}%</span>
              </div>
              <Progress value={data?.distribution?.page10} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Vont au-delà page 20</span>
                <span>{data?.distribution?.page20}%</span>
              </div>
              <Progress value={data?.distribution?.page20} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={data?.coveragePercent} className="h-2" />
            <div className="flex justify-between text-sm">
              <span>Couverture: {data?.coveragePercent}%</span>
              <span>+{data?.dailyProgress}% / jour</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {data?.pagesRemaining} pages restantes à découvrir
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
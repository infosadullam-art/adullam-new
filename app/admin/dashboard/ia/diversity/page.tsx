// app/admin/dashboard/ia/diversity/page.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { dashboardApi } from "@/lib/admin/api-client"
import { Palette, RefreshCw } from "lucide-react"

export default function IaDiversityPage() {
  const [data, setData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const res = await dashboardApi.getDiversityMetrics()
      if (res.success) setData(res.data)
    } catch (error) {
      console.error("Erreur chargement diversité:", error)
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
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light">Diversité intelligente</h1>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Rafraîchir
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition des 20%</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Populaires</span>
                <span>{data?.breakdown?.popular}%</span>
              </div>
              <Progress value={data?.breakdown?.popular} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Nouveautés</span>
                <span>{data?.breakdown?.new}%</span>
              </div>
              <Progress value={data?.breakdown?.new} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Aléatoire</span>
                <span>{data?.breakdown?.random}%</span>
              </div>
              <Progress value={data?.breakdown?.random} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-xl font-light">{data?.performance?.popular}%</p>
                <p className="text-xs text-muted-foreground">Populaire</p>
              </div>
              <div>
                <p className="text-xl font-light">{data?.performance?.new}%</p>
                <p className="text-xs text-muted-foreground">Nouveauté</p>
              </div>
              <div>
                <p className="text-xl font-light">{data?.performance?.random}%</p>
                <p className="text-xs text-muted-foreground">Aléatoire</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Couverture catalogue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-light text-center">{data?.catalogCoverage}%</p>
            <Progress value={data?.catalogCoverage} className="h-2 mt-4" />
            <p className="text-sm text-muted-foreground text-center mt-2">
              Estimation: {data?.estimatedDaysToFull} jours pour tout voir
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
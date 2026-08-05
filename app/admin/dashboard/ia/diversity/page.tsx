// app/admin/dashboard/ia/diversity/page.tsx

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { dashboardApi } from "@/lib/admin/api-client"
import { Palette, RefreshCw, TrendingUp, Target } from "lucide-react"

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
        <h1 className="text-2xl font-light flex items-center gap-2">
          <Palette className="h-6 w-6 text-purple-500" />
          Diversité intelligente
        </h1>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Rafraîchir
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Répartition des 20% */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Répartition des 20%</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Populaires</span>
                <span>{data?.breakdown?.popular || 0}%</span>
              </div>
              <Progress value={data?.breakdown?.popular || 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Nouveautés</span>
                <span>{data?.breakdown?.new || 0}%</span>
              </div>
              <Progress value={data?.breakdown?.new || 0} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Aléatoire</span>
                <span>{data?.breakdown?.random || 0}%</span>
              </div>
              <Progress value={data?.breakdown?.random || 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-green-50 rounded-lg">
                <p className="text-xl font-light text-green-700">{data?.performance?.popular || 0}%</p>
                <p className="text-xs text-muted-foreground">Populaire</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <p className="text-xl font-light text-blue-700">{data?.performance?.new || 0}%</p>
                <p className="text-xs text-muted-foreground">Nouveauté</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg">
                <p className="text-xl font-light text-purple-700">{data?.performance?.random || 0}%</p>
                <p className="text-xs text-muted-foreground">Aléatoire</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Couverture catalogue */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Couverture catalogue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-4xl font-light text-center">{data?.catalogCoverage || 0}%</p>
                <Progress value={data?.catalogCoverage || 0} className="h-2 mt-4" />
              </div>
              <div className="text-center border-l pl-4">
                <p className="text-2xl font-light">{data?.catalogSize || 0}</p>
                <p className="text-xs text-muted-foreground">Produits catalogués</p>
              </div>
              <div className="text-center border-l pl-4">
                <p className="text-2xl font-light">{data?.estimatedDaysToFull || 0}j</p>
                <p className="text-xs text-muted-foreground">Jours pour tout voir</p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <span className="text-muted-foreground">Couverture 80%</span>
                <p className="font-medium">{data?.coverage80 || 0} produits</p>
              </div>
              <div>
                <span className="text-muted-foreground">Diversité actuelle</span>
                <p className="font-medium">{data?.currentDiversity || 0}%</p>
              </div>
              <div>
                <span className="text-muted-foreground">Diversité cible</span>
                <p className="font-medium">{data?.targetDiversity || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
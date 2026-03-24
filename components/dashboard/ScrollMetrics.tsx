"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { ScrollText, TrendingUp, Trophy, Eye } from "lucide-react"

interface ScrollMetricsProps {
  data: {
    avgDepth: number
    distribution: { page5: number; page10: number; page20: number }
    record: number
    uniqueProductsSeen: number
    totalProducts: number
    coveragePercent: number
    dailyProgress: number
    pagesRemaining: number
  }
}

export function ScrollMetrics({ data }: ScrollMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ScrollText className="h-5 w-5 text-indigo-500" />
          Scroll Infini - Exploration
        </CardTitle>
        <CardDescription>
          Comment les utilisateurs parcourent le catalogue
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats principales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold">{data.avgDepth}</div>
            <p className="text-xs text-muted-foreground">Pages en moyenne</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold">{data.record}</div>
            <p className="text-xs text-muted-foreground">Record (pages)</p>
          </div>
        </div>

        {/* Distribution */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Profondeur de scroll</h4>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Vont jusqu'à page 5</span>
              <span className="font-medium">{data.distribution.page5}%</span>
            </div>
            <Progress value={data.distribution.page5} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Vont jusqu'à page 10</span>
              <span className="font-medium">{data.distribution.page10}%</span>
            </div>
            <Progress value={data.distribution.page10} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Vont au-delà page 20</span>
              <span className="font-medium">{data.distribution.page20}%</span>
            </div>
            <Progress value={data.distribution.page20} className="h-2" />
          </div>
        </div>

        {/* Couverture produits */}
        <div className="space-y-3 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Produits uniques vus</span>
            <span className="font-medium">{data.uniqueProductsSeen.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total catalogue</span>
            <span className="font-medium">{data.totalProducts.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Couverture</span>
            <span className="text-indigo-500">{data.coveragePercent.toFixed(1)}%</span>
          </div>
          
          <Progress value={data.coveragePercent} className="h-2 mt-2" />
        </div>

        {/* Progression */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progression quotidienne</span>
            <Badge variant="outline" className="text-green-500">
              +{data.dailyProgress.toFixed(1)}% / jour
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {data.pagesRemaining} pages restantes à découvrir
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <TrendingUp className="h-3 w-3" />
            <span>Estimation: {Math.ceil(data.pagesRemaining / data.dailyProgress)} jours pour tout voir</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
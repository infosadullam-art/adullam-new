"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Palette, TrendingUp, Sparkles, Target } from "lucide-react"

interface DiversityMetricsProps {
  data: {
    breakdown: { popular: number; new: number; random: number }
    performance: { popular: number; new: number; random: number }
    catalogCoverage: number
    estimatedDaysToFull: number
  }
}

export function DiversityMetrics({ data }: DiversityMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5 text-purple-500" />
          Diversité Intelligente (20%)
        </CardTitle>
        <CardDescription>
          Analyse des produits de découverte
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Répartition des 20% */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Répartition des sources</h4>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Populaires</span>
              <span className="font-medium">{data.breakdown.popular}%</span>
            </div>
            <Progress value={data.breakdown.popular} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Nouveautés</span>
              <span className="font-medium">{data.breakdown.new}%</span>
            </div>
            <Progress value={data.breakdown.new} className="h-2" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Aléatoire intelligent</span>
              <span className="font-medium">{data.breakdown.random}%</span>
            </div>
            <Progress value={data.breakdown.random} className="h-2" />
          </div>
        </div>

        {/* Performance par source */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-medium">CTR par source</h4>
          
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2 bg-muted/30 rounded">
              <div className="text-lg font-semibold text-blue-500">
                {data.performance.popular.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Populaire</p>
            </div>
            <div className="p-2 bg-muted/30 rounded">
              <div className="text-lg font-semibold text-green-500">
                {data.performance.new.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Nouveauté</p>
            </div>
            <div className="p-2 bg-muted/30 rounded">
              <div className="text-lg font-semibold text-amber-500">
                {data.performance.random.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Aléatoire</p>
            </div>
          </div>
        </div>

        {/* Couverture catalogue */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Couverture catalogue</span>
            <Badge variant="outline" className="text-purple-500">
              {data.catalogCoverage.toFixed(1)}%
            </Badge>
          </div>
          
          <Progress value={data.catalogCoverage} className="h-2" />
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Target className="h-3 w-3" />
            <span>Objectif 100% dans {data.estimatedDaysToFull} jours</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
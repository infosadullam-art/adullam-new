"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Target, Zap, Award } from "lucide-react"

interface QualityMetricsProps {
  data: {
    ctr: { prediction: number; diversity: number; overall: number }
    conversion: { prediction: number; diversity: number; overall: number }
    engagement: number
    bestCategory: string
    diversityToPrediction: { clicked: number; converted: number; rate: number }
  }
}

export function QualityMetrics({ data }: QualityMetricsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-500" />
          Qualité des Recommandations
        </CardTitle>
        <CardDescription>
          Performance des prédictions vs diversité
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* CTR Comparison */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Taux de clic (CTR)</span>
            <Badge variant="outline" className="text-blue-500">
              +{((data.ctr.prediction - data.ctr.diversity) / data.ctr.diversity * 100).toFixed(1)}% prédictions
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Prédictions (80%)</span>
                <span className="font-medium">{data.ctr.prediction.toFixed(1)}%</span>
              </div>
              <Progress value={data.ctr.prediction * 5} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Diversité (20%)</span>
                <span className="font-medium">{data.ctr.diversity.toFixed(1)}%</span>
              </div>
              <Progress value={data.ctr.diversity * 5} className="h-2" />
            </div>
            
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Global</span>
                <span className="font-bold">{data.ctr.overall.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Comparison */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Taux de conversion</span>
            <Badge variant="outline" className="text-green-500">
              {data.conversion.diversity > 0 ? 'Découverte qui convertit' : 'En apprentissage'}
            </Badge>
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Prédictions</span>
                <span className="font-medium">{data.conversion.prediction.toFixed(2)}%</span>
              </div>
              <Progress value={data.conversion.prediction * 10} className="h-2" />
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-muted-foreground">Diversité</span>
                <span className="font-medium">{data.conversion.diversity.toFixed(2)}%</span>
              </div>
              <Progress value={data.conversion.diversity * 10} className="h-2" />
            </div>
          </div>
        </div>

        {/* Engagement & Best Category */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-500">
              {(data.engagement * 100).toFixed(0)}%
            </div>
            <p className="text-xs text-muted-foreground">Engagement</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-amber-500">
              <Award className="h-4 w-4" />
              <span className="text-sm font-semibold truncate">{data.bestCategory}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Catégorie top</p>
          </div>
        </div>

        {/* Diversité → Prédiction */}
        {data.diversityToPrediction.clicked > 0 && (
          <div className="bg-muted/50 p-3 rounded-lg space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-amber-500" />
              <span className="font-medium">Découverte → Prédiction</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Produits cliqués</span>
              <span>{data.diversityToPrediction.clicked}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Devenus prédictions</span>
              <span className="text-green-500">{data.diversityToPrediction.converted}</span>
            </div>
            <div className="flex justify-between text-sm font-medium">
              <span>Taux d'adoption</span>
              <span>{data.diversityToPrediction.rate.toFixed(1)}%</span>
            </div>
            <Progress value={data.diversityToPrediction.rate} className="h-1 mt-1" />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
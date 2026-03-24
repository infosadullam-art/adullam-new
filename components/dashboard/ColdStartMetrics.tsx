"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, Clock, UserPlus } from "lucide-react"

interface ColdStartMetricsProps {
  data: {
    newUsers: number
    avgCtr: number
    timeToFirstInteraction: number
    conversionRate: number
    knownUsers: number
    knownCtr: number
    knownConversion: number
    progression: number
  }
}

export function ColdStartMetrics({ data }: ColdStartMetricsProps) {
  const improvement = ((data.knownCtr - data.avgCtr) / data.avgCtr * 100) || 0
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-green-500" />
          Cold Start - Nouveaux Utilisateurs
        </CardTitle>
        <CardDescription>
          Performance sans historique
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Stats principales */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold">{data.newUsers}</div>
            <p className="text-xs text-muted-foreground">Nouveaux users</p>
          </div>
          <div className="text-center p-3 bg-muted/30 rounded-lg">
            <div className="text-2xl font-bold">{data.timeToFirstInteraction}s</div>
            <p className="text-xs text-muted-foreground">Temps avant action</p>
          </div>
        </div>

        {/* Comparaison New vs Known */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">CTR nouveaux</span>
              <span className="font-medium">{data.avgCtr.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">CTR connus</span>
              <span className="font-medium text-green-500">{data.knownCtr.toFixed(1)}%</span>
            </div>
            <Progress 
              value={(data.avgCtr / data.knownCtr) * 100} 
              className="h-2 mt-2" 
            />
            <div className="flex justify-end mt-1">
              <Badge variant="outline" className="text-green-500 text-xs">
                +{improvement.toFixed(0)}% avec historique
              </Badge>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Conversion nouveaux</span>
              <span className="font-medium">{data.conversionRate.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Conversion connus</span>
              <span className="font-medium text-green-500">{data.knownConversion.toFixed(2)}%</span>
            </div>
            <Progress 
              value={(data.conversionRate / data.knownConversion) * 100} 
              className="h-2 mt-2" 
            />
          </div>
        </div>

        {/* Progression cold start */}
        <div className="bg-muted/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progression vers phase 2</span>
            <span className="text-sm font-bold">{data.progression} users</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Utilisateurs passés du cold start au profil connu
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
            <TrendingUp className="h-3 w-3" />
            <span>+{((data.progression / data.newUsers) * 100).toFixed(0)}% des nouveaux</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
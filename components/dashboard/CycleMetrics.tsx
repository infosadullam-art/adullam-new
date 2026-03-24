"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Brain, Zap, Database, TrendingUp, Activity, Clock } from "lucide-react"

interface CycleMetricsProps {
  data: {
    ia1: {
      users: number
      interactions: number
      products: number
      avgError: number
      lastTraining: string
      dailyIncrease: number
    }
    ia2: {
      requests: number
      avgResponseTime: number
      ratio80: number
      ratio20: number
      lastRequest: string
    }
    redis: {
      scores: number
      activeSessions: number
      hitRate: number
      latency: number
    }
  }
}

export function CycleMetrics({ data }: CycleMetricsProps) {
  return (
    <Card className="col-span-3">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-500" />
          Cycle Vertueux - Temps Réel
        </CardTitle>
        <CardDescription>
          L'apprentissage de l'IA en direct
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 md:grid-cols-3">
          {/* IA #1 - ALS */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-500" />
              <h3 className="font-semibold">IA #1 (ALS)</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Utilisateurs</span>
                  <span className="font-medium">{data.ia1.users}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>+{data.ia1.dailyIncrease} aujourd'hui</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Interactions</span>
                  <span className="font-medium">{data.ia1.interactions.toLocaleString()}</span>
                </div>
                <Progress value={75} className="h-1 mt-1" />
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Produits</span>
                  <span className="font-medium">{data.ia1.products}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Erreur moyenne</span>
                  <span className={`font-medium ${
                    data.ia1.avgError < 0.1 ? 'text-green-500' : 
                    data.ia1.avgError < 0.3 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {data.ia1.avgError.toFixed(3)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Précision {((1 - data.ia1.avgError) * 100).toFixed(1)}%</span>
                  {data.ia1.avgError < 0.1 && <Badge variant="outline" className="text-green-500">✓ Bonne</Badge>}
                </div>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Dernier apprentissage: {data.ia1.lastTraining}
              </div>
            </div>
          </div>

          {/* IA #2 - Temps Réel */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              <h3 className="font-semibold">IA #2 (Temps réel)</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Requêtes aujourd'hui</span>
                  <span className="font-medium">{data.ia2.requests.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Temps réponse</span>
                  <span className="font-medium">{data.ia2.avgResponseTime}ms</span>
                </div>
                <Progress value={Math.min(100, 100 - data.ia2.avgResponseTime)} className="h-1 mt-1" />
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ratio 80/20</span>
                  <span className="font-medium">{data.ia2.ratio80}% / {data.ia2.ratio20}%</span>
                </div>
                <div className="flex h-2 mt-1 rounded-full overflow-hidden">
                  <div className="bg-blue-500" style={{ width: `${data.ia2.ratio80}%` }} />
                  <div className="bg-purple-500" style={{ width: `${data.ia2.ratio20}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Prédictions</span>
                  <span>Diversité</span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Dernière requête: {data.ia2.lastRequest}
              </div>
            </div>
          </div>

          {/* Redis - Synchronisation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-green-500" />
              <h3 className="font-semibold">Redis (Sync)</h3>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Scores en cache</span>
                  <span className="font-medium">{data.redis.scores}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Sessions actives</span>
                  <span className="font-medium">{data.redis.activeSessions}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cache hit rate</span>
                  <span className="font-medium">{data.redis.hitRate}%</span>
                </div>
                <Progress value={data.redis.hitRate} className="h-1 mt-1" />
              </div>

              <div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Latence</span>
                  <span className="font-medium">{data.redis.latency}ms</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
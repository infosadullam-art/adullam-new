"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { dashboardApi } from "@/lib/admin/api-client"
import { Brain, RefreshCw, TrendingUp, Users, Database, Zap, Target, AlertTriangle, AlertCircle, Info } from "lucide-react"
import Link from "next/link"

export default function IaCyclePage() {
  const [data, setData] = useState<any>(null)
  const [alerts, setAlerts] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Charger les métriques
      const res = await dashboardApi.getCycleMetrics()
      if (res.success) {
        setData(res.data)
      } else {
        setError("Erreur chargement des métriques")
      }
      
      // Charger les alertes via dashboardApi (pas de fetch direct)
      try {
        const alertsRes = await dashboardApi.getAlerts()
        if (alertsRes && alertsRes.success) {
          setAlerts(alertsRes.data)
        }
      } catch (alertErr) {
        console.error("Erreur chargement alertes:", alertErr)
        // Ne pas bloquer l'affichage des métriques
      }
    } catch (error) {
      console.error("Erreur chargement cycle:", error)
      setError("Impossible de charger les données. Vérifiez que le backend est accessible.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // Rafraîchir toutes les 30 secondes
    const interval = setInterval(loadData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-red-800">Erreur de chargement</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={loadData}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-light">Cycle Vertueux</h1>
        <Button variant="outline" size="sm" onClick={loadData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Rafraîchir
        </Button>
      </div>

      {/* Bannière d'alertes */}
      {alerts?.alerts && alerts.alerts.length > 0 && (
        <div className="space-y-2">
          {/* Alertes critiques */}
          {alerts.alerts.filter((a: any) => a.level === 'critical').map((alert: any, idx: number) => (
            <div key={idx} className="bg-red-50 border-l-4 border-red-600 p-4 rounded shadow-sm">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-medium text-red-800">{alert.message}</p>
                  {alert.impact && <p className="text-sm text-red-700 mt-1">{alert.impact}</p>}
                  {alert.action && (
                    <p className="text-sm font-medium text-red-800 mt-2">→ {alert.action}</p>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Alertes warning */}
          {alerts.alerts.filter((a: any) => a.level === 'warning').length > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-800">
                    {alerts.alerts.filter((a: any) => a.level === 'warning').length} alerte(s) à vérifier
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Alertes info */}
          {alerts.alerts.filter((a: any) => a.level === 'info').length > 0 && (
            <div className="bg-blue-50 border-l-4 border-blue-400 p-3 rounded">
              <div className="flex items-start">
                <Info className="h-5 w-5 text-blue-600 mr-3 flex-shrink-0" />
                <div>
                  <p className="text-sm text-blue-800">
                    {alerts.alerts.filter((a: any) => a.level === 'info').length} information(s)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* IA #1 - ALS */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-purple-500" />
              IA #1 - ALS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Utilisateurs</span>
                <span className="font-medium">{data?.ia1?.users ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Interactions</span>
                <span className="font-medium">{data?.ia1?.interactions ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Produits</span>
                <span className="font-medium">{data?.ia1?.products ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Erreur moyenne</span>
                <span className="font-medium">{data?.ia1?.avgError ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Dernier entraînement</span>
                <span className="font-medium text-xs">{data?.ia1?.lastTraining ? new Date(data.ia1.lastTraining).toLocaleString() : '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IA #2 - Temps réel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-500" />
              IA #2 - Temps réel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Requêtes</span>
                <span className="font-medium">{data?.ia2?.requests ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Temps réponse</span>
                <span className="font-medium">{data?.ia2?.avgResponseTime ?? 0}ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Ratio 80/20</span>
                <span className="font-medium">{data?.ia2?.ratio80 ?? 70}/{data?.ia2?.ratio20 ?? 30}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Dernière requête</span>
                <span className="font-medium text-xs">{data?.ia2?.lastRequest ? new Date(data.ia2.lastRequest).toLocaleString() : '-'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Redis Cache */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-500" />
              Redis Cache
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Scores en cache</span>
                <span className="font-medium">{data?.redis?.scores ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Sessions actives</span>
                <span className="font-medium">{data?.redis?.activeSessions ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Hit rate</span>
                <span className="font-medium">{data?.redis?.hitRate ?? 0}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Latence</span>
                <span className="font-medium">{data?.redis?.latency ?? 0}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
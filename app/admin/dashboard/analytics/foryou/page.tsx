"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  TrendingUp, 
  Calendar,
  Download,
  RefreshCw,
  Package,
  Users,
  Clock,
  Zap,
  Sparkles,
  Eye,
  ShoppingCart
} from "lucide-react"
import { recommendationsApi } from "@/lib/admin/api-client"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts"

interface ForYouStats {
  overview: {
    totalRecommendations: number
    clickThroughRate: number
    conversionRate: number
    avgPosition: number
  }
  topProducts: Array<{
    id: string
    title: string
    image?: string
    recommendationsCount: number
    clicks: number
    conversions: number
    ctr: number
  }>
  performanceBySegment: Array<{
    segment: string
    impressions: number
    clicks: number
    ctr: number
  }>
  recentActivity: Array<{
    id: string
    userId: string
    userName: string
    productId: string
    productTitle: string
    action: 'view' | 'click' | 'purchase'
    timestamp: string
  }>
}

const adminPath = "/admin/dashboard"
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

function formatNumber(value: number): string {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
  return value.toString()
}

function formatPercentage(value: number): string {
  return value.toFixed(1) + '%'
}

export default function ForYouAnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [stats, setStats] = useState<ForYouStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week')
  const [isRefreshing, setIsRefreshing] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/admin/login")
      return
    }
    if (user?.role !== "ADMIN") {
      router.replace("/admin/login")
      return
    }
    loadData()
  }, [authLoading, user, period])

  const loadData = async (refresh = false) => {
    if (refresh) setIsRefreshing(true)
    else setIsLoading(true)
    
    try {
      // Simuler des données pour l'exemple
      // À remplacer par un vrai appel API
      const mockData: ForYouStats = {
        overview: {
          totalRecommendations: 15420,
          clickThroughRate: 3.8,
          conversionRate: 1.2,
          avgPosition: 2.4
        },
        topProducts: [
          {
            id: "prod1",
            title: "Smartphone XYZ Pro",
            image: "https://via.placeholder.com/40",
            recommendationsCount: 1250,
            clicks: 48,
            conversions: 12,
            ctr: 3.8
          },
          {
            id: "prod2",
            title: "Casque Audio Sans Fil",
            image: "https://via.placeholder.com/40",
            recommendationsCount: 980,
            clicks: 42,
            conversions: 8,
            ctr: 4.3
          },
          {
            id: "prod3",
            title: "Montre Connectée Sport",
            image: "https://via.placeholder.com/40",
            recommendationsCount: 750,
            clicks: 28,
            conversions: 5,
            ctr: 3.7
          },
          {
            id: "prod4",
            title: "Sac à Dos Urbain",
            image: "https://via.placeholder.com/40",
            recommendationsCount: 620,
            clicks: 19,
            conversions: 3,
            ctr: 3.1
          }
        ],
        performanceBySegment: [
          { segment: "Nouveaux utilisateurs", impressions: 5200, clicks: 156, ctr: 3.0 },
          { segment: "Utilisateurs actifs", impressions: 6800, clicks: 312, ctr: 4.6 },
          { segment: "Acheteurs fréquents", impressions: 3420, clicks: 188, ctr: 5.5 },
          { segment: "Inactifs (30j)", impressions: 2100, clicks: 42, ctr: 2.0 }
        ],
        recentActivity: [
          {
            id: "act1",
            userId: "user1",
            userName: "Jean Dupont",
            productId: "prod1",
            productTitle: "Smartphone XYZ Pro",
            action: 'click',
            timestamp: new Date(Date.now() - 5 * 60000).toISOString()
          },
          {
            id: "act2",
            userId: "user2",
            userName: "Marie Martin",
            productId: "prod3",
            productTitle: "Montre Connectée Sport",
            action: 'purchase',
            timestamp: new Date(Date.now() - 15 * 60000).toISOString()
          },
          {
            id: "act3",
            userId: "user3",
            userName: "Pierre Durand",
            productId: "prod2",
            productTitle: "Casque Audio Sans Fil",
            action: 'view',
            timestamp: new Date(Date.now() - 25 * 60000).toISOString()
          }
        ]
      }
      
      setStats(mockData)
    } catch (error) {
      console.error("Failed to load for you analytics:", error)
      toast.error("Failed to load for you analytics")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleExport = () => {
    toast.success("Export started. You'll receive an email when ready.")
  }

  const handleRunScoring = () => {
    toast.success("Scoring job triggered successfully")
  }

  if (isLoading || authLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!stats) return null

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader
        title="For You Analytics"
        description="Performance des recommandations personnalisées"
        backButton={
          <Button variant="ghost" size="icon" asChild>
            <Link href={`${adminPath}/feed`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
        }
        actions={
          <div className="flex items-center gap-2">
            <Select value={period} onValueChange={(value: any) => setPeriod(value)}>
              <SelectTrigger className="w-[150px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={handleExport}>
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => loadData(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        }
      />

      <div className="p-6 space-y-6">
        {/* Bouton Run Scoring */}
        <div className="flex justify-end">
          <Button onClick={handleRunScoring}>
            <Sparkles className="mr-2 h-4 w-4" />
            Lancer le scoring
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recommandations</p>
                  <p className="text-2xl font-bold">{formatNumber(stats.overview.totalRecommendations)}</p>
                </div>
                <Zap className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux de clic (CTR)</p>
                  <p className="text-2xl font-bold">{formatPercentage(stats.overview.clickThroughRate)}</p>
                </div>
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux de conversion</p>
                  <p className="text-2xl font-bold">{formatPercentage(stats.overview.conversionRate)}</p>
                </div>
                <ShoppingCart className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Position moyenne</p>
                  <p className="text-2xl font-bold">{stats.overview.avgPosition}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Products Recommandés */}
        <Card>
          <CardHeader>
            <CardTitle>Produits les plus recommandés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary shrink-0">
                    #{index + 1}
                  </div>
                  
                  <div className="h-10 w-10 rounded-lg bg-muted overflow-hidden shrink-0">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <Link 
                      href={`${adminPath}/products/${product.id}`}
                      className="font-medium hover:text-primary hover:underline block truncate"
                    >
                      {product.title}
                    </Link>
                  </div>

                  <div className="grid grid-cols-4 gap-6 text-sm shrink-0">
                    <div>
                      <p className="text-muted-foreground">Recommandations</p>
                      <p className="font-medium">{formatNumber(product.recommendationsCount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Clics</p>
                      <p className="font-medium">{formatNumber(product.clicks)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Conversions</p>
                      <p className="font-medium">{formatNumber(product.conversions)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">CTR</p>
                      <p className="font-medium">{formatPercentage(product.ctr)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance par segment */}
        <Card>
          <CardHeader>
            <CardTitle>Performance par segment d'utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.performanceBySegment.map((segment, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg border">
                  <div className="w-32 font-medium">{segment.segment}</div>
                  <div className="flex-1 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Impressions</p>
                      <p className="font-medium">{formatNumber(segment.impressions)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Clics</p>
                      <p className="font-medium">{formatNumber(segment.clicks)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">CTR</p>
                      <p className="font-medium">{formatPercentage(segment.ctr)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Activité récente */}
        <Card>
          <CardHeader>
            <CardTitle>Activité récente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.action === 'purchase' ? 'bg-green-500' :
                    activity.action === 'click' ? 'bg-blue-500' : 'bg-gray-500'
                  }`} />
                  <Link 
                    href={`${adminPath}/users/${activity.userId}`}
                    className="font-medium hover:text-primary"
                  >
                    {activity.userName}
                  </Link>
                  <span className="text-muted-foreground">
                    {activity.action === 'purchase' ? 'a acheté' :
                     activity.action === 'click' ? 'a cliqué sur' : 'a vu'}
                  </span>
                  <Link 
                    href={`${adminPath}/products/${activity.productId}`}
                    className="text-primary hover:underline"
                  >
                    {activity.productTitle}
                  </Link>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(activity.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
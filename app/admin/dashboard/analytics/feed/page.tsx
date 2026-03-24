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
  Eye,
  Heart,
  Play,
  Users,
  Clock,
  Zap,
  Sparkles,
  Video,
  Filter,
  ThumbsUp,
  Share2,
  MessageCircle
} from "lucide-react"
import { feedApi } from "@/lib/admin/api-client"
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
  LineChart,
  Line,
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
import { Progress } from "@/components/ui/progress"

interface FeedAnalytics {
  overview: {
    totalImpressions: number
    totalEngagement: number
    avgWatchTime: number
    clickThroughRate: number
    trend: {
      impressions: number
      engagement: number
      watchTime: number
    }
  }
  dailyPerformance: Array<{
    date: string
    impressions: number
    engagements: number
    clicks: number
  }>
  topContent: Array<{
    id: string
    title: string
    type: 'video' | 'product' | 'story'
    image?: string
    impressions: number
    engagements: number
    engagementRate: number
    avgWatchTime: number
  }>
  performanceByHour: Array<{
    hour: number
    impressions: number
    engagements: number
  }>
  engagementByType: Array<{
    type: string
    count: number
    percentage: number
  }>
  demographics: {
    ageGroups: Array<{ group: string; percentage: number }>
    devices: Array<{ device: string; percentage: number }>
    locations: Array<{ country: string; percentage: number }>
  }
}

const adminPath = "/admin/dashboard"
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#FF6B6B']

function formatNumber(value: number): string {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
  return value.toString()
}

function formatPercentage(value: number): string {
  return value.toFixed(1) + '%'
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

export default function FeedAnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [data, setData] = useState<FeedAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [period, setPeriod] = useState<'day' | 'week' | 'month' | 'year'>('week')
  const [contentType, setContentType] = useState<string>("all")
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
  }, [authLoading, user, period, contentType])

  const loadData = async (refresh = false) => {
    if (refresh) setIsRefreshing(true)
    else setIsLoading(true)
    
    try {
      // Simuler des données pour l'exemple
      // À remplacer par un vrai appel API
      const mockData: FeedAnalytics = {
        overview: {
          totalImpressions: 125000,
          totalEngagement: 8750,
          avgWatchTime: 45,
          clickThroughRate: 3.2,
          trend: {
            impressions: 12,
            engagement: 8,
            watchTime: 5
          }
        },
        dailyPerformance: generateDailyData(30),
        topContent: [
          {
            id: "vid1",
            title: "Smartphone XYZ Pro - Unboxing",
            type: "video",
            image: "https://via.placeholder.com/40",
            impressions: 12500,
            engagements: 850,
            engagementRate: 6.8,
            avgWatchTime: 120
          },
          {
            id: "vid2",
            title: "Casque Audio Sans Fil - Test",
            type: "video",
            image: "https://via.placeholder.com/40",
            impressions: 9800,
            engagements: 620,
            engagementRate: 6.3,
            avgWatchTime: 95
          },
          {
            id: "prod1",
            title: "Montre Connectée Sport",
            type: "product",
            image: "https://via.placeholder.com/40",
            impressions: 7500,
            engagements: 410,
            engagementRate: 5.5,
            avgWatchTime: 30
          }
        ],
        performanceByHour: generateHourlyData(),
        engagementByType: [
          { type: "Likes", count: 4200, percentage: 48 },
          { type: "Commentaires", count: 2100, percentage: 24 },
          { type: "Partages", count: 1500, percentage: 17 },
          { type: "Clics", count: 950, percentage: 11 }
        ],
        demographics: {
          ageGroups: [
            { group: "18-24", percentage: 25 },
            { group: "25-34", percentage: 35 },
            { group: "35-44", percentage: 22 },
            { group: "45-54", percentage: 12 },
            { group: "55+", percentage: 6 }
          ],
          devices: [
            { device: "Mobile", percentage: 68 },
            { device: "Desktop", percentage: 22 },
            { device: "Tablet", percentage: 10 }
          ],
          locations: [
            { country: "États-Unis", percentage: 32 },
            { country: "France", percentage: 18 },
            { country: "Royaume-Uni", percentage: 12 },
            { country: "Allemagne", percentage: 8 },
            { country: "Autres", percentage: 30 }
          ]
        }
      }
      
      setData(mockData)
    } catch (error) {
      console.error("Failed to load feed analytics:", error)
      toast.error("Failed to load feed analytics")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Générer des données daily
  const generateDailyData = (days: number) => {
    const data = []
    const now = new Date()
    for (let i = days; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        impressions: Math.round(3000 + Math.random() * 5000),
        engagements: Math.round(200 + Math.random() * 400),
        clicks: Math.round(100 + Math.random() * 200)
      })
    }
    return data
  }

  // Générer des données horaires
  const generateHourlyData = () => {
    const data = []
    for (let hour = 0; hour < 24; hour++) {
      let impressions = 500
      let engagements = 35
      
      if (hour >= 12 && hour <= 14) {
        impressions = 1200
        engagements = 90
      } else if (hour >= 18 && hour <= 22) {
        impressions = 2000
        engagements = 150
      } else if (hour >= 23 || hour <= 5) {
        impressions = 200
        engagements = 12
      }
      
      data.push({
        hour,
        impressions: Math.round(impressions + Math.random() * 200),
        engagements: Math.round(engagements + Math.random() * 20)
      })
    }
    return data
  }

  const handleExport = () => {
    toast.success("Export started. You'll receive an email when ready.")
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

  if (!data) return null

  return (
    <div className="min-h-screen bg-background">
      <AdminHeader
        title="Feed Analytics"
        description="Analyse détaillée des performances du feed"
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
                <SelectItem value="year">Cette année</SelectItem>
              </SelectContent>
            </Select>
            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tout</SelectItem>
                <SelectItem value="video">Vidéos</SelectItem>
                <SelectItem value="product">Produits</SelectItem>
                <SelectItem value="story">Stories</SelectItem>
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
        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Impressions</p>
                  <p className="text-2xl font-bold">{formatNumber(data.overview.totalImpressions)}</p>
                </div>
                <Eye className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="mt-2 text-xs text-green-600">
                ↑ {data.overview.trend.impressions}% vs période précédente
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Engagements</p>
                  <p className="text-2xl font-bold">{formatNumber(data.overview.totalEngagement)}</p>
                </div>
                <Heart className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="mt-2 text-xs text-green-600">
                ↑ {data.overview.trend.engagement}% vs période précédente
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Temps de visionnage</p>
                  <p className="text-2xl font-bold">{formatDuration(data.overview.avgWatchTime)}</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                Moyen par vue
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Taux de clic</p>
                  <p className="text-2xl font-bold">{formatPercentage(data.overview.clickThroughRate)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="mt-2 text-xs text-blue-600">
                Objectif: 3.5%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="hours">Heures de pointe</TabsTrigger>
            <TabsTrigger value="engagement">Types d'engagement</TabsTrigger>
            <TabsTrigger value="demographics">Audience</TabsTrigger>
          </TabsList>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>Performance quotidienne</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.dailyPerformance}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        yAxisId="left"
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={formatNumber}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))'
                        }}
                        formatter={(value: any) => formatNumber(value)}
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="impressions" 
                        stroke="#0088FE" 
                        strokeWidth={2}
                        name="Impressions"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="engagements" 
                        stroke="#00C49F" 
                        strokeWidth={2}
                        name="Engagements"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="clicks" 
                        stroke="#FFBB28" 
                        strokeWidth={2}
                        name="Clics"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Performance par heure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.performanceByHour}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="hour" 
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={(hour) => `${hour}h`}
                      />
                      <YAxis 
                        yAxisId="left"
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                        tickFormatter={formatNumber}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        className="text-xs"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))'
                        }}
                        formatter={(value: any) => formatNumber(value)}
                        labelFormatter={(hour) => `${hour}:00 - ${hour + 1}:00`}
                      />
                      <Bar yAxisId="left" dataKey="impressions" fill="#0088FE" radius={[4, 4, 0, 0]} />
                      <Bar yAxisId="right" dataKey="engagements" fill="#00C49F" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="engagement">
            <Card>
              <CardHeader>
                <CardTitle>Types d'engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.engagementByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ type, percentage }) => `${type} ${percentage}%`}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {data.engagementByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))',
                          borderColor: 'hsl(var(--border))'
                        }}
                        formatter={(value: any) => formatNumber(value)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="demographics">
            <Card>
              <CardHeader>
                <CardTitle>Démographie de l'audience</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  {/* Âge */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Tranches d'âge</h3>
                    <div className="space-y-2">
                      {data.demographics.ageGroups.map((group) => (
                        <div key={group.group} className="flex items-center gap-2">
                          <span className="text-xs w-12">{group.group}</span>
                          <Progress value={group.percentage} className="h-2 flex-1" />
                          <span className="text-xs w-10 text-right">{group.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Appareils */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Appareils</h3>
                    <div className="space-y-2">
                      {data.demographics.devices.map((device) => (
                        <div key={device.device} className="flex items-center gap-2">
                          <span className="text-xs w-16">{device.device}</span>
                          <Progress value={device.percentage} className="h-2 flex-1" />
                          <span className="text-xs w-10 text-right">{device.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Localisation */}
                  <div>
                    <h3 className="text-sm font-medium mb-3">Pays</h3>
                    <div className="space-y-2">
                      {data.demographics.locations.map((loc) => (
                        <div key={loc.country} className="flex items-center gap-2">
                          <span className="text-xs w-20 truncate">{loc.country}</span>
                          <Progress value={loc.percentage} className="h-2 flex-1" />
                          <span className="text-xs w-10 text-right">{loc.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Top Content */}
        <Card>
          <CardHeader>
            <CardTitle>Contenu le plus performant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.topContent.map((item, index) => (
                <Link
                  key={item.id}
                  href={item.type === 'video' 
                    ? `${adminPath}/videos/${item.id}`
                    : `${adminPath}/products/${item.id}`
                  }
                  className="flex items-center gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary shrink-0">
                    #{index + 1}
                  </div>

                  <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        {item.type === 'video' ? <Video className="h-5 w-5" /> : <Package className="h-5 w-5" />}
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <Badge variant="outline" className="mt-1">
                      {item.type === 'video' ? 'Vidéo' : 'Produit'}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-4 gap-6 text-sm">
                    <div>
                      <p className="text-muted-foreground">Impressions</p>
                      <p className="font-medium">{formatNumber(item.impressions)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Engagements</p>
                      <p className="font-medium">{formatNumber(item.engagements)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Taux</p>
                      <p className="font-medium">{formatPercentage(item.engagementRate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Temps</p>
                      <p className="font-medium">{formatDuration(item.avgWatchTime)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
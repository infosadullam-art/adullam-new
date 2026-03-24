"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/header"
import { StatsCard } from "@/components/admin/stats-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { dashboardApi } from "@/lib/admin/api-client"
import { 
  Package, 
  ShoppingCart, 
  DollarSign, 
  TrendingUp, 
  Activity, 
  Import, 
  Users,
  Eye,
  RefreshCw,
  Download,
  PlusCircle,
  Settings,
  BarChart3,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileText,
  UserPlus,
  Brain,
  Zap,
  Target,
  Palette,
  ScrollText
} from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { useAuth } from "@/lib/admin/auth-context"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// ============================================================
// IMPORT DES NOUVEAUX COMPOSANTS
// ============================================================
import { CycleMetrics } from "@/components/dashboard/CycleMetrics"
import { QualityMetrics } from "@/components/dashboard/QualityMetrics"
import { ColdStartMetrics } from "@/components/dashboard/ColdStartMetrics"
import { DiversityMetrics } from "@/components/dashboard/DiversityMetrics"
import { ScrollMetrics } from "@/components/dashboard/ScrollMetrics"

// ============================================================
// INTERFACES
// ============================================================

export interface DashboardData {
  products: { 
    total: number; 
    byStatus: Record<string, number>;
    categories: Array<{ name: string; count: number }>;
    lowStock: number;
    outOfStock: number;
  }
  orders: {
    totalOrders: number
    totalRevenue: number
    avgOrderValue: number
    byStatus: Record<string, number>
    recentOrders: Array<{ id: string; orderNumber: string; total: number; status: string; createdAt: string; customer: { name: string; email: string } }>
    dailyRevenue: Array<{ date: string; revenue: number; orders: number }>
  }
  imports: {
    totalBatches: number
    totalProducts: number
    duplicates: number
    fakes: number
    recentBatches: Array<{ id: string; source: string; status: string; totalItems: number; createdAt: string; processedItems: number }>
  }
  interactions: { 
    total: number; 
    uniqueUsers: number; 
    byType: Record<string, number>;
    dailyActive: Array<{ date: string; count: number }>;
  }
  jobs: { 
    total: number; 
    running: number; 
    failed: number;
    completed: number;
    pending: number;
    recentJobs: Array<{ id: string; name: string; status: string; progress: number; createdAt: string }>;
  }
  customers: {
    total: number;
    newToday: number;
    active: number;
  }
  // ✅ NOUVEAU : métriques du cycle vertueux
  cycle?: {
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
  quality?: {
    ctr: { prediction: number; diversity: number; overall: number }
    conversion: { prediction: number; diversity: number; overall: number }
    engagement: number
    bestCategory: string
    diversityToPrediction: { clicked: number; converted: number; rate: number }
  }
  coldStart?: {
    newUsers: number
    avgCtr: number
    timeToFirstInteraction: number
    conversionRate: number
    knownUsers: number
    knownCtr: number
    knownConversion: number
    progression: number
  }
  diversity?: {
    breakdown: { popular: number; new: number; random: number }
    performance: { popular: number; new: number; random: number }
    catalogCoverage: number
    estimatedDaysToFull: number
  }
  scroll?: {
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

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

function formatCurrencyUSD(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(value)
}

function formatNumber(value: number): string {
  if (value >= 1000000000) {
    return (value / 1000000000).toFixed(1) + 'B'
  }
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return value.toString()
}

function getStatusColor(status: string) {
  const colors: Record<string, string> = {
    ACTIVE: "bg-green-500",
    PENDING: "bg-yellow-500",
    PROCESSING: "bg-blue-500",
    COMPLETED: "bg-green-500",
    DELIVERED: "bg-green-500",
    SHIPPED: "bg-blue-500",
    CANCELLED: "bg-red-500",
    FAILED: "bg-red-500",
    DRAFT: "bg-gray-500",
    OUT_OF_STOCK: "bg-orange-500",
    RUNNING: "bg-blue-500",
    SUCCESS: "bg-green-500",
    ERROR: "bg-red-500",
  }
  return colors[status] || "bg-gray-500"
}

function getStatusIcon(status: string) {
  switch(status) {
    case 'COMPLETED':
    case 'DELIVERED':
    case 'SUCCESS':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />
    case 'PENDING':
    case 'PROCESSING':
    case 'RUNNING':
      return <Clock className="h-4 w-4 text-yellow-500" />
    case 'CANCELLED':
    case 'FAILED':
    case 'ERROR':
      return <XCircle className="h-4 w-4 text-red-500" />
    default:
      return <AlertCircle className="h-4 w-4 text-gray-500" />
  }
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [cycleData, setCycleData] = useState<any>(null)
  const [qualityData, setQualityData] = useState<any>(null)
  const [coldStartData, setColdStartData] = useState<any>(null)
  const [diversityData, setDiversityData] = useState<any>(null)
  const [scrollData, setScrollData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month' | 'year'>('week')
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const adminPath = "/admin/dashboard"

  const getDateRangeFromPeriod = (period: string) => {
    const now = new Date()
    let startDate: Date
    
    switch(period) {
      case 'today':
        startDate = new Date(now.setHours(0, 0, 0, 0))
        break
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7))
        break
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1))
        break
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1))
        break
      default:
        startDate = new Date(now.setDate(now.getDate() - 7))
    }
    
    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0]
    }
  }

  // 🔹 Charger toutes les données
  const loadAllData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true)
    else setIsLoading(true)
    
    try {
      // 1️⃣ Charger les données du dashboard principal
      const { startDate, endDate } = getDateRangeFromPeriod(dateRange)
      const statsRes = await dashboardApi.getStats(startDate, endDate)

      if (statsRes.success && statsRes.data) {
        setData(statsRes.data as DashboardData)
      }

      // 2️⃣ Charger les métriques du cycle vertueux
      const [cycleRes, qualityRes, coldStartRes, diversityRes, scrollRes] = await Promise.all([
        dashboardApi.getCycleMetrics(),
        dashboardApi.getQualityMetrics(),
        dashboardApi.getColdStartMetrics(),
        dashboardApi.getDiversityMetrics(),
        dashboardApi.getScrollMetrics()
      ])

      if (cycleRes.success) setCycleData(cycleRes.data)
      if (qualityRes.success) setQualityData(qualityRes.data)
      if (coldStartRes.success) setColdStartData(coldStartRes.data)
      if (diversityRes.success) setDiversityData(diversityRes.data)
      if (scrollRes.success) setScrollData(scrollRes.data)

    } catch (err) {
      console.error("Failed to load dashboard:", err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleExport = async (format: 'csv' | 'pdf' | 'excel') => {
    try {
      const { startDate, endDate } = getDateRangeFromPeriod(dateRange)
      const response = await dashboardApi.exportData({ format, startDate, endDate })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `dashboard-export.${format}`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.replace("/admin/login")
        return
      }
      if (user.role !== "ADMIN") {
        router.replace("/admin/login")
        return
      }

      loadAllData()

      const interval = setInterval(() => loadAllData(true), 5 * 60 * 1000)
      return () => clearInterval(interval)
    }
  }, [authLoading, user, router, dateRange])

  useEffect(() => {
    if (!authLoading && user === null) {
      router.replace("/admin/login")
    }
  }, [user, authLoading, router])

  // 🔹 Transform data pour les charts
  const orderStatusData = data?.orders?.byStatus
    ? Object.entries(data.orders.byStatus).map(([status, count]) => ({ status, count }))
    : []

  const interactionData = data?.interactions?.byType
    ? Object.entries(data.interactions.byType).map(([type, count]) => ({
        type: type.replace("_", " "),
        count,
      }))
    : []

  const revenueData = data?.orders?.dailyRevenue || []

  const jobStatusData = data?.jobs ? [
    { name: 'Running', value: data.jobs.running },
    { name: 'Completed', value: data.jobs.completed },
    { name: 'Failed', value: data.jobs.failed },
    { name: 'Pending', value: data.jobs.pending },
  ].filter(item => item.value > 0) : []

  if (isLoading || authLoading) {
    return (
      <div className="p-10 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <AdminHeader 
        title="Dashboard" 
        description="Overview of your e-commerce platform"
        actions={
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="year">This Year</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Export as</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('excel')}>
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('pdf')}>
                  PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button 
              variant="outline" 
              size="icon"
              onClick={() => loadAllData(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        }
      />

      <div className="px-6 space-y-6">
        {/* ============================================================
             SECTION CYCLE VERTUEUX
        ============================================================ */}
        {cycleData && (
          <div className="grid gap-6">
            <CycleMetrics data={cycleData} />
            
            <div className="grid gap-6 lg:grid-cols-2">
              {qualityData && <QualityMetrics data={qualityData} />}
              {coldStartData && <ColdStartMetrics data={coldStartData} />}
            </div>
            
            <div className="grid gap-6 lg:grid-cols-2">
              {diversityData && <DiversityMetrics data={diversityData} />}
              {scrollData && <ScrollMetrics data={scrollData} />}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        {data && (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href={`${adminPath}/products`}>
                <StatsCard
                  title="Total Products"
                  value={data.products.total ?? 0}
                  icon={Package}
                  description={`${data.products.byStatus?.ACTIVE ?? 0} active · ${data.products.lowStock ?? 0} low stock`}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                />
              </Link>
              
              <Link href={`${adminPath}/orders`}>
                <StatsCard
                  title="Total Orders"
                  value={data.orders.totalOrders ?? 0}
                  icon={ShoppingCart}
                  description={`${data.orders.byStatus?.PENDING ?? 0} pending · ${data.orders.byStatus?.PROCESSING ?? 0} processing`}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                />
              </Link>
              
              <StatsCard
                title="Total Revenue"
                value={formatCurrencyUSD(data.orders.totalRevenue ?? 0)}
                icon={DollarSign}
                trend={{ value: 12.5, isPositive: true }}
                description="vs last month"
              />
              
              <StatsCard
                title="Avg Order Value"
                value={formatCurrencyUSD(data.orders.avgOrderValue ?? 0)}
                icon={TrendingUp}
                trend={{ value: 5.2, isPositive: true }}
                description="vs last month"
              />
            </div>

            {/* Second Row Stats */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href={`${adminPath}/imports`}>
                <StatsCard
                  title="Import Batches"
                  value={data.imports.totalBatches ?? 0}
                  icon={Import}
                  description={`${data.imports.totalProducts ?? 0} products imported`}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                />
              </Link>
              
              <StatsCard
                title="Duplicates"
                value={data.imports.duplicates ?? 0}
                icon={Activity}
                description={`${((data.imports.duplicates / data.imports.totalProducts) * 100 || 0).toFixed(1)}% of imports`}
              />
              
              <Link href={`${adminPath}/users`}>
                <StatsCard
                  title="Customers"
                  value={data.customers?.total ?? 0}
                  icon={Users}
                  description={`${data.customers?.newToday ?? 0} new today · ${data.customers?.active ?? 0} active`}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                />
              </Link>
              
              <Link href={`${adminPath}/jobs`}>
                <StatsCard
                  title="Active Jobs"
                  value={data.jobs.running ?? 0}
                  icon={Activity}
                  description={`${data.jobs.completed ?? 0} completed · ${data.jobs.failed ?? 0} failed`}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                />
              </Link>
            </div>
          </>
        )}

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Revenue Chart */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Daily revenue for the selected period</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`${adminPath}/analytics/revenue`}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Detailed Analytics
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="date" 
                        className="text-xs" 
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <YAxis 
                        yAxisId="left"
                        className="text-xs" 
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                        tickFormatter={(value) => formatCurrencyUSD(value)}
                      />
                      <YAxis 
                        yAxisId="right"
                        orientation="right"
                        className="text-xs" 
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                        formatter={(value: any, name: string) => {
                          if (name === 'revenue') return formatCurrencyUSD(value)
                          return value
                        }}
                      />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                        name="Revenue"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="orders" 
                        stroke="hsl(var(--secondary))" 
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--secondary))" }}
                        name="Orders"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Orders by Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={orderStatusData}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis 
                          dataKey="status" 
                          className="text-xs" 
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <YAxis 
                          className="text-xs" 
                          tick={{ fill: "hsl(var(--muted-foreground))" }}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                        />
                        <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                          {orderStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" size="sm" className="w-full" asChild>
                    <Link href={`${adminPath}/orders`}>
                      <Eye className="h-4 w-4 mr-2" />
                      View All Orders
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Interactions by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={interactionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ type, percent }) => `${type} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="count"
                        >
                          {interactionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activities */}
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Recent Orders */}
              <Card className="lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Orders</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`${adminPath}/orders`}>
                      View all
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.orders.recentOrders?.length ? (
                      data.orders.recentOrders.slice(0, 5).map((order) => (
                        <Link 
                          key={order.id} 
                          href={`${adminPath}/orders/${order.id}`}
                          className="block hover:bg-muted/50 p-2 rounded-lg transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="font-medium">{order.orderNumber}</p>
                              <p className="text-sm text-muted-foreground">{order.customer?.name || 'Anonymous'}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right space-y-1">
                              <Badge variant="outline" className={`${getStatusColor(order.status)} text-white border-0`}>
                                {order.status}
                              </Badge>
                              <p className="font-medium">{formatCurrencyUSD(order.total)}</p>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No recent orders</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full" asChild>
                    <Link href={`${adminPath}/orders/new`}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create New Order
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Recent Imports */}
              <Card className="lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Recent Imports</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`${adminPath}/imports`}>
                      View all
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.imports.recentBatches?.length ? (
                      data.imports.recentBatches.slice(0, 5).map((batch) => (
                        <Link 
                          key={batch.id} 
                          href={`${adminPath}/imports/${batch.id}`}
                          className="block hover:bg-muted/50 p-2 rounded-lg transition-colors"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="font-medium">{batch.source}</p>
                              <Badge variant="outline" className={`${getStatusColor(batch.status)} text-white border-0`}>
                                {batch.status}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {new Date(batch.createdAt).toLocaleDateString()}
                              </span>
                              <span className="text-muted-foreground">
                                {batch.processedItems || 0}/{batch.totalItems} items
                              </span>
                            </div>
                            {batch.status === 'PROCESSING' && (
                              <Progress value={(batch.processedItems / batch.totalItems) * 100} className="h-1" />
                            )}
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No import batches</p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`${adminPath}/imports/new`}>
                      <Import className="h-4 w-4 mr-2" />
                      New Import
                    </Link>
                  </Button>
                </CardFooter>
              </Card>

              {/* Recent Jobs */}
              <Card className="lg:col-span-1">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Active Jobs</CardTitle>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`${adminPath}/jobs`}>
                      View all
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data?.jobs.recentJobs?.length ? (
                      data.jobs.recentJobs.slice(0, 5).map((job) => (
                        <Link 
                          key={job.id} 
                          href={`${adminPath}/jobs/${job.id}`}
                          className="block hover:bg-muted/50 p-2 rounded-lg transition-colors"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(job.status)}
                                <p className="font-medium">{job.name}</p>
                              </div>
                              <Badge variant="outline" className={`${getStatusColor(job.status)} text-white border-0`}>
                                {job.status}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                {new Date(job.createdAt).toLocaleDateString()}
                              </span>
                              {job.progress !== undefined && (
                                <span className="text-muted-foreground">
                                  {job.progress}%
                                </span>
                              )}
                            </div>
                            {job.progress !== undefined && (
                              <Progress value={job.progress} className="h-1" />
                            )}
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No active jobs</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <Card>
              <CardHeader>
                <CardTitle>Advanced Analytics</CardTitle>
                <CardDescription>Detailed metrics and insights</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" className="h-24" asChild>
                    <Link href={`${adminPath}/analytics/sales`}>
                      <TrendingUp className="h-8 w-8 mr-4" />
                      <div className="text-left">
                        <p className="font-semibold">Sales Analytics</p>
                        <p className="text-sm text-muted-foreground">View sales trends and forecasts</p>
                      </div>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-24" asChild>
                    <Link href={`${adminPath}/analytics/products`}>
                      <Package className="h-8 w-8 mr-4" />
                      <div className="text-left">
                        <p className="font-semibold">Product Performance</p>
                        <p className="text-sm text-muted-foreground">Best sellers and inventory</p>
                      </div>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-24" asChild>
                    <Link href={`${adminPath}/analytics/customers`}>
                      <Users className="h-8 w-8 mr-4" />
                      <div className="text-left">
                        <p className="font-semibold">Customer Insights</p>
                        <p className="text-sm text-muted-foreground">Customer behavior and retention</p>
                      </div>
                    </Link>
                  </Button>
                  
                  <Button variant="outline" className="h-24" asChild>
                    <Link href={`${adminPath}/analytics/reports`}>
                      <FileText className="h-8 w-8 mr-4" />
                      <div className="text-left">
                        <p className="font-semibold">Custom Reports</p>
                        <p className="text-sm text-muted-foreground">Generate custom reports</p>
                      </div>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Generated Reports</CardTitle>
                <CardDescription>Access and download reports</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Monthly Sales Report</p>
                        <p className="text-sm text-muted-foreground">Generated on March 1, 2024</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <FileText className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Inventory Status</p>
                        <p className="text-sm text-muted-foreground">Generated on March 1, 2024</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                  
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`${adminPath}/reports/generate`}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Generate New Report
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-4">
              <Button variant="outline" className="justify-start" asChild>
                <Link href={`${adminPath}/products/new`}>
                  <Package className="h-4 w-4 mr-2" />
                  Add Product
                </Link>
              </Button>
              
              <Button variant="outline" className="justify-start" asChild>
                <Link href={`${adminPath}/orders/new`}>
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Create Order
                </Link>
              </Button>
              
              <Button variant="outline" className="justify-start" asChild>
                <Link href={`${adminPath}/users/new`}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add User
                </Link>
              </Button>
              
              <Button variant="outline" className="justify-start" asChild>
                <Link href={`${adminPath}/settings`}>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
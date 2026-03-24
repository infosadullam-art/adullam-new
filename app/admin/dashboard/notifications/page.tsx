"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/header"
import { StatsCard } from "@/components/admin/stats-card"
import { DataTable } from "@/components/admin/data-table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { notificationsApi } from "@/lib/admin/api-client"
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  MessageCircle, 
  Mail, 
  Smartphone,
  RefreshCw,
  Eye,
  Trash2,
  Filter,
  Calendar,
  Send,
  AlertTriangle,
  Info,
  Clock,
  Package,
  Users,
  MoreHorizontal
} from "lucide-react"  // ← AJOUT DE Package et Users ici
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

interface Notification {
  id: string
  type: string
  channel: 'WHATSAPP' | 'SMS' | 'EMAIL' | 'PUSH'
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED'
  title: string
  message: string
  recipient?: string
  metadata?: Record<string, any>
  sentAt: string | null
  deliveredAt?: string | null
  readAt?: string | null
  createdAt: string
}

interface NotificationStats {
  total: number
  failedCount: number
  byChannel: Record<string, number>
  byStatus: Record<string, number>
  byType: Record<string, number>
  daily: Array<{ date: string; count: number }>
}

interface Meta {
  page: number
  totalPages: number
  total: number
}

const adminPath = "/admin/dashboard"

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    DELIVERED: "default",
    SENT: "secondary",
    READ: "default",
    PENDING: "outline",
    FAILED: "destructive",
  }
  
  const icons: Record<string, any> = {
    DELIVERED: CheckCircle,
    SENT: Send,
    READ: Eye,
    PENDING: Clock,
    FAILED: XCircle,
  }
  
  const Icon = icons[status] || Bell
  
  return (
    <Badge variant={variants[status] || "outline"} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  )
}

function getChannelBadge(channel: string) {
  const icons: Record<string, any> = {
    WHATSAPP: MessageCircle,
    SMS: Smartphone,
    EMAIL: Mail,
    PUSH: Bell,
  }
  
  const colors: Record<string, string> = {
    WHATSAPP: "bg-green-500 hover:bg-green-600",
    SMS: "bg-blue-500 hover:bg-blue-600",
    EMAIL: "bg-purple-500 hover:bg-purple-600",
    PUSH: "bg-orange-500 hover:bg-orange-600",
  }
  
  const Icon = icons[channel] || Bell
  
  return (
    <Badge className={`${colors[channel] || "bg-gray-500"} text-white border-0 flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {channel}
    </Badge>
  )
}

function getTypeIcon(type: string) {
  if (type.includes('ORDER')) return Package
  if (type.includes('USER')) return Users
  if (type.includes('ALERT')) return AlertTriangle
  if (type.includes('INFO')) return Info
  return Bell
}

function formatDate(dateString: string | null): string {
  if (!dateString) return "-"
  return new Date(dateString).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth()

  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [meta, setMeta] = useState<Meta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [page, setPage] = useState(1)
  const [channelFilter, setChannelFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")

  useEffect(() => {
    loadData()
  }, [page, channelFilter, statusFilter, typeFilter])

  async function loadData(refresh = false) {
    if (refresh) setIsRefreshing(true)
    else setIsLoading(true)
    
    try {
      const params: Record<string, string | number | boolean | undefined> = { 
        page, 
        limit: 20 
      }
      if (channelFilter && channelFilter !== "all") params.channel = channelFilter
      if (statusFilter && statusFilter !== "all") params.status = statusFilter
      if (typeFilter && typeFilter !== "all") params.type = typeFilter

      const [notifRes, statsRes] = await Promise.all([
        notificationsApi.list(params), 
        notificationsApi.stats()
      ])

      if (notifRes.success) {
        setNotifications(notifRes.data as Notification[])
        setMeta(notifRes.meta as Meta)
      }
      if (statsRes.success) {
        setStats(statsRes.data as NotificationStats)
      }
    } catch (error) {
      console.error("Failed to load notifications:", error)
      toast.error("Failed to load notifications")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  async function handleRetry(id: string) {
    try {
      await notificationsApi.retry(id)
      toast.success("Notification retried")
      loadData()
    } catch (error) {
      toast.error("Failed to retry notification")
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this notification?")) return
    try {
      await notificationsApi.delete(id)
      toast.success("Notification deleted")
      loadData()
    } catch (error) {
      toast.error("Failed to delete notification")
    }
  }

  const columns = [
    {
      key: "notification",
      header: "Notification",
      cell: (notif: Notification) => {
        const TypeIcon = getTypeIcon(notif.type)
        return (
          <Link 
            href={`${adminPath}/notifications/${notif.id}`}
            className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
          >
            <div className={`mt-1 p-1 rounded-full ${
              notif.status === 'FAILED' ? 'bg-red-100' : 'bg-primary/10'
            }`}>
              <TypeIcon className={`h-4 w-4 ${
                notif.status === 'FAILED' ? 'text-red-500' : 'text-primary'
              }`} />
            </div>
            <div className="flex-1">
              <p className="font-medium group-hover:text-primary">{notif.title}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
              {notif.recipient && (
                <p className="text-xs text-muted-foreground mt-1">To: {notif.recipient}</p>
              )}
            </div>
          </Link>
        )
      },
    },
    {
      key: "channel",
      header: "Channel",
      cell: (notif: Notification) => (
        <Link 
          href={`${adminPath}/notifications?channel=${notif.channel}`}
          className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          {getChannelBadge(notif.channel)}
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (notif: Notification) => (
        <Link 
          href={`${adminPath}/notifications?status=${notif.status}`}
          className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          {getStatusBadge(notif.status)}
        </Link>
      ),
    },
    {
      key: "timeline",
      header: "Timeline",
      cell: (notif: Notification) => (
        <div className="p-2">
          <div className="flex items-center gap-1 text-xs">
            <Calendar className="h-3 w-3 text-muted-foreground" />
            <span>Created: {formatDate(notif.createdAt)}</span>
          </div>
          {notif.sentAt && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Send className="h-3 w-3" />
              <span>Sent: {formatDate(notif.sentAt)}</span>
            </div>
          )}
          {notif.deliveredAt && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>Delivered: {formatDate(notif.deliveredAt)}</span>
            </div>
          )}
          {notif.readAt && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>Read: {formatDate(notif.readAt)}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[50px]",
      cell: (notif: Notification) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`${adminPath}/notifications/${notif.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            
            {notif.status === 'FAILED' && (
              <DropdownMenuItem onClick={() => handleRetry(notif.id)}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </DropdownMenuItem>
            )}
            
            <DropdownMenuItem 
              onClick={() => handleDelete(notif.id)} 
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  if (isLoading || authLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const successRate = stats?.total 
    ? (((stats.total - (stats.failedCount || 0)) / stats.total) * 100).toFixed(1)
    : '0'

  return (
    <div>
      <AdminHeader
        title="Notifications"
        description="Monitor notification delivery across all channels"
        actions={
          <Button variant="outline" onClick={() => loadData(true)} disabled={isRefreshing}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards avec liens */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href={`${adminPath}/notifications`} className="block">
            <StatsCard 
              title="Total Notifications" 
              value={stats?.total || 0} 
              icon={Bell}
              className="cursor-pointer hover:shadow-lg transition-shadow" 
            />
          </Link>
          
          <Link href={`${adminPath}/notifications?status=DELIVERED`} className="block">
            <StatsCard 
              title="Delivered" 
              value={stats?.byStatus?.DELIVERED || 0} 
              icon={CheckCircle}
              className="cursor-pointer hover:shadow-lg transition-shadow" 
            />
          </Link>
          
          <Link href={`${adminPath}/notifications?status=FAILED`} className="block">
            <StatsCard 
              title="Failed" 
              value={stats?.failedCount || 0} 
              icon={XCircle}
              className="cursor-pointer hover:shadow-lg transition-shadow" 
            />
          </Link>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Success Rate</p>
                  <p className="text-2xl font-bold text-green-600">{successRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Channel Breakdown avec liens */}
        {stats?.byChannel && (
          <Card>
            <CardHeader>
              <CardTitle>By Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(stats.byChannel).map(([channel, count]) => (
                  <Link
                    key={channel}
                    href={`${adminPath}/notifications?channel=${channel}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    {getChannelBadge(channel)}
                    <span className="text-lg font-semibold">{count}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle>Notification Logs</CardTitle>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={channelFilter}
                  onValueChange={(v) => {
                    setChannelFilter(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Channel" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Channels</SelectItem>
                    <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                    <SelectItem value="SMS">SMS</SelectItem>
                    <SelectItem value="EMAIL">Email</SelectItem>
                    <SelectItem value="PUSH">Push</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={statusFilter}
                  onValueChange={(v) => {
                    setStatusFilter(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="SENT">Sent</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="READ">Read</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={typeFilter}
                  onValueChange={(v) => {
                    setTypeFilter(v)
                    setPage(1)
                  }}
                >
                  <SelectTrigger className="w-[130px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="ORDER_CONFIRMATION">Order</SelectItem>
                    <SelectItem value="SHIPPING_UPDATE">Shipping</SelectItem>
                    <SelectItem value="PROMOTION">Promotion</SelectItem>
                    <SelectItem value="ALERT">Alert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={columns}
              data={notifications}
              isLoading={isLoading}
              pagination={
                meta
                  ? {
                      page: meta.page,
                      totalPages: meta.totalPages,
                      total: meta.total,
                      onPageChange: setPage,
                    }
                  : undefined
              }
              emptyMessage="No notifications found"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
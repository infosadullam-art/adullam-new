"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { videosApi } from "@/lib/admin/api-client"
import { 
  Plus, 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Eye, 
  Search,
  Video,
  Heart,
  Play,
  Calendar,
  Clock,
  Filter
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

interface Video {
  id: string
  title: string
  description?: string
  thumbnail?: string
  duration: number
  viewCount: number
  likeCount: number
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  product?: {
    id: string
    title: string
    images: string[]
  }
  user?: {
    id: string
    name: string
  }
  createdAt: string
}

interface Meta {
  page: number
  limit: number
  total: number
  totalPages: number
}

// 🔹 Base path pour les routes admin
const adminPath = "/admin/dashboard"

function formatNumber(value: number): string {
  if (value >= 1000000) return (value / 1000000).toFixed(1) + 'M'
  if (value >= 1000) return (value / 1000).toFixed(1) + 'K'
  return value.toString()
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })
}

function getStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    ACTIVE: "default",
    DRAFT: "secondary",
    ARCHIVED: "outline",
  }
  return <Badge variant={variants[status] || "outline"}>{status}</Badge>
}

export default function VideosPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const [videos, setVideos] = useState<Video[]>([])
  const [meta, setMeta] = useState<Meta | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState(searchParams.get('search') || "")
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || "all")

  // 🔹 Vérifie l'auth
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
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      loadVideos()
    }
  }, [page, statusFilter, search, user])

  async function loadVideos() {
    setIsLoading(true)
    try {
      const params: Record<string, string | number | undefined> = { 
        page, 
        limit: 20 
      }
      if (statusFilter && statusFilter !== "all") params.status = statusFilter
      if (search) params.search = search

      const response = await videosApi.list(params)
      if (response.success) {
        setVideos(response.data as Video[])
        setMeta(response.meta as Meta)
      } else {
        toast.error(response.error || "Failed to load videos")
      }
    } catch (error) {
      console.error("Failed to load videos:", error)
      toast.error("Failed to load videos")
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this video?")) return
    try {
      const response = await videosApi.delete(id)
      if (response.success) {
        toast.success("Video deleted successfully")
        loadVideos()
      } else {
        toast.error(response.error || "Failed to delete video")
      }
    } catch (error) {
      toast.error("Failed to delete video")
    }
  }

  const columns = [
    {
      key: "video",
      header: "Video",
      cell: (video: Video) => (
        <Link 
          href={`${adminPath}/videos/${video.id}`}
          className="flex items-center gap-3 hover:bg-muted/50 p-2 rounded-lg transition-colors group"
        >
          <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden flex-shrink-0 relative">
            {video.thumbnail ? (
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center">
                <Video className="h-5 w-5 text-muted-foreground" />
              </div>
            )}
            <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
              {formatDuration(video.duration)}
            </div>
          </div>
          <div>
            <p className="font-medium group-hover:text-primary line-clamp-1">
              {video.title}
            </p>
            {video.product && (
              <Link 
                href={`${adminPath}/products/${video.product.id}`}
                className="text-xs text-muted-foreground hover:text-primary hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {video.product.title}
              </Link>
            )}
          </div>
        </Link>
      ),
    },
    {
      key: "performance",
      header: "Performance",
      cell: (video: Video) => (
        <Link 
          href={`${adminPath}/videos/${video.id}`}
          className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4 text-muted-foreground" />
              {formatNumber(video.viewCount)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-muted-foreground" />
              {formatNumber(video.likeCount)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Engagement: {video.viewCount > 0 ? ((video.likeCount / video.viewCount) * 100).toFixed(1) : 0}%
          </p>
        </Link>
      ),
    },
    {
      key: "status",
      header: "Status",
      cell: (video: Video) => (
        <Link 
          href={`${adminPath}/videos?status=${video.status}`}
          className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          {getStatusBadge(video.status)}
        </Link>
      ),
    },
    {
      key: "creator",
      header: "Creator",
      cell: (video: Video) => (
        video.user ? (
          <Link 
            href={`${adminPath}/users/${video.user.id}`}
            className="block p-2 rounded-lg hover:bg-muted/50 transition-colors"
          >
            <span className="text-sm hover:text-primary">{video.user.name}</span>
          </Link>
        ) : (
          <span className="text-sm text-muted-foreground p-2">—</span>
        )
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      cell: (video: Video) => (
        <Link 
          href={`${adminPath}/videos/${video.id}`}
          className="flex items-center gap-1 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors"
        >
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {formatDate(video.createdAt)}
        </Link>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-[50px]",
      cell: (video: Video) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="hover:bg-muted">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`${adminPath}/videos/${video.id}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`${adminPath}/videos/${video.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDelete(video.id)} 
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

  // Loading state
  if (authLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-64" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </div>
    )
  }

  // Auth check
  if (!user || user.role !== "ADMIN") {
    return null
  }

  // Statistiques
  const totalViews = videos.reduce((sum, v) => sum + v.viewCount, 0)
  const totalLikes = videos.reduce((sum, v) => sum + v.likeCount, 0)
  const avgEngagement = totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) : '0'

  return (
    <div>
      <AdminHeader
        title="Videos"
        description="Manage video content and performance"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href={`${adminPath}/feed`}>
                <Play className="mr-2 h-4 w-4" />
                Feed Analytics
              </Link>
            </Button>
            <Button asChild>
              <Link href={`${adminPath}/videos/new`}>
                <Plus className="mr-2 h-4 w-4" />
                New Video
              </Link>
            </Button>
          </div>
        }
      />

      <div className="p-6">
        {/* Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Videos</p>
              <p className="text-2xl font-bold">{meta?.total || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Views</p>
              <p className="text-2xl font-bold">{formatNumber(totalViews)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Total Likes</p>
              <p className="text-2xl font-bold">{formatNumber(totalLikes)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">Avg Engagement</p>
              <p className="text-2xl font-bold">{avgEngagement}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search videos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadVideos()}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => {
                setStatusFilter(v)
                setPage(1)
              }}
            >
              <SelectTrigger className="w-[150px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ARCHIVED">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Videos Table */}
        <DataTable
          columns={columns}
          data={videos}
          isLoading={isLoading}
          pagination={
            meta
              ? {
                  page: meta.page,
                  totalPages: meta.totalPages,
                  onPageChange: setPage,
                }
              : undefined
          }
          emptyMessage="No videos found"
        />
      </div>
    </div>
  )
}
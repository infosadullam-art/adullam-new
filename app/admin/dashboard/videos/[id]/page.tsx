"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  ArrowLeft, 
  Pencil, 
  Trash2, 
  Video,
  Eye,
  Heart,
  Play,
  Calendar,
  User,
  Package,
  Clock,
  TrendingUp,
  Share2,
  Download
} from "lucide-react"
import { videosApi } from "@/lib/admin/api-client"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Progress } from "@/components/ui/progress"

interface Video {
  id: string
  title: string
  description?: string
  url: string
  thumbnail?: string
  duration: number
  viewCount: number
  likeCount: number
  shareCount: number
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'
  product?: {
    id: string
    title: string
    sku: string
    images: string[]
    price: number
  }
  user?: {
    id: string
    name: string
    email: string
  }
  tags?: string[]
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

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
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
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

export default function VideoDetailPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const videoId = params.id as string

  const [video, setVideo] = useState<Video | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/admin/login")
      return
    }
    if (user?.role !== "ADMIN") {
      router.replace("/admin/login")
      return
    }
    loadVideo()
  }, [authLoading, user, videoId])

  const loadVideo = async () => {
    setIsLoading(true)
    try {
      const response = await videosApi.get(videoId)
      if (response.success) {
        setVideo(response.data as Video)
      } else {
        toast.error("Video not found")
        router.push(`${adminPath}/videos`)
      }
    } catch (error) {
      console.error("Failed to load video:", error)
      toast.error("Failed to load video")
      router.push(`${adminPath}/videos`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      const response = await videosApi.delete(videoId)
      if (response.success) {
        toast.success("Video deleted successfully")
        router.push(`${adminPath}/videos`)
      } else {
        toast.error(response.error || "Failed to delete video")
      }
    } catch (error) {
      toast.error("Failed to delete video")
    }
  }

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="border-b bg-card sticky top-0 z-10">
          <div className="flex h-16 items-center gap-4 px-6">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <div className="p-6">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-[400px] w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!video) return null

  const engagementRate = video.viewCount > 0 
    ? ((video.likeCount / video.viewCount) * 100).toFixed(1)
    : '0'

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card sticky top-0 z-10">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`${adminPath}/videos`}>
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-lg font-semibold line-clamp-1">{video.title}</h1>
              <p className="text-sm text-muted-foreground">ID: {video.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`${adminPath}/videos/${videoId}/edit`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setDeleteDialogOpen(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Video Player & Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <Card>
              <CardContent className="p-4">
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <video 
                    src={video.url} 
                    poster={video.thumbnail}
                    controls
                    className="w-full h-full"
                  >
                    Your browser does not support the video tag.
                  </video>
                </div>
                
                <div className="mt-4">
                  <h2 className="text-xl font-semibold">{video.title}</h2>
                  {video.description && (
                    <p className="text-muted-foreground mt-2">{video.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 mt-4">
                    <div className="flex items-center gap-1 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDuration(video.duration)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDate(video.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      {getStatusBadge(video.status)}
                    </div>
                  </div>

                  {video.tags && video.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {video.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-4">
                  <div className="text-center">
                    <Eye className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-2xl font-bold">{formatNumber(video.viewCount)}</p>
                    <p className="text-sm text-muted-foreground">Views</p>
                  </div>
                  <div className="text-center">
                    <Heart className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-2xl font-bold">{formatNumber(video.likeCount)}</p>
                    <p className="text-sm text-muted-foreground">Likes</p>
                  </div>
                  <div className="text-center">
                    <Share2 className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-2xl font-bold">{formatNumber(video.shareCount || 0)}</p>
                    <p className="text-sm text-muted-foreground">Shares</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-2xl font-bold">{engagementRate}%</p>
                    <p className="text-sm text-muted-foreground">Engagement</p>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Like Rate</span>
                    <span className="font-medium">{engagementRate}%</span>
                  </div>
                  <Progress value={parseFloat(engagementRate)} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Related Info */}
          <div className="space-y-6">
            {/* Product Info */}
            {video.product && (
              <Card>
                <CardHeader>
                  <CardTitle>Featured Product</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`${adminPath}/products/${video.product.id}`}
                    className="flex gap-4 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                      {video.product.images[0] ? (
                        <img 
                          src={video.product.images[0]} 
                          alt={video.product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="h-6 w-6 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary">
                        {video.product.title}
                      </p>
                      <p className="text-sm text-muted-foreground">SKU: {video.product.sku}</p>
                      <p className="text-sm font-semibold mt-1">
                        ${video.product.price.toFixed(2)}
                      </p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Creator Info */}
            {video.user && (
              <Card>
                <CardHeader>
                  <CardTitle>Creator</CardTitle>
                </CardHeader>
                <CardContent>
                  <Link
                    href={`${adminPath}/users/${video.user.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <User className="h-10 w-10 p-2 bg-muted rounded-full" />
                    <div>
                      <p className="font-medium group-hover:text-primary">{video.user.name}</p>
                      <p className="text-sm text-muted-foreground">{video.user.email}</p>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={video.url} target="_blank">
                    <Play className="mr-2 h-4 w-4" />
                    Watch Video
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`${adminPath}/analytics/video/${video.id}`}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Detailed Analytics
                  </Link>
                </Button>
                {video.product && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`${adminPath}/products/${video.product.id}`}>
                      <Package className="mr-2 h-4 w-4" />
                      View Product
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Video</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{video.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
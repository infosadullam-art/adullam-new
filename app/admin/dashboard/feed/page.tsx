"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { StatsCard } from "@/components/admin/stats-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { feedApi, jobsApi } from "@/lib/admin/api-client"
import { Video, Eye, Heart, Play, Sparkles, TrendingUp, Calendar, User, Film } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/admin/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

interface FeedStats {
  totalVideos: number
  totalViews: number
  totalLikes: number
  topVideos: Array<{
    id: string
    viewCount: number
    likeCount: number
    product: { 
      id: string
      title: string
      slug?: string
      images?: string[]
    }
    video?: {
      id: string
      url: string
      duration?: number
    }
  }>
  recentJobs?: Array<{
    id: string
    name: string
    status: string
    createdAt: string
  }>
}

// 🔹 Base path pour les routes admin
const adminPath = "/admin/dashboard"

function formatNumber(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  }
  return value.toString()
}

function getJobStatusBadge(status: string) {
  const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
    COMPLETED: "default",
    RUNNING: "secondary",
    PENDING: "outline",
    FAILED: "destructive",
  }
  return <Badge variant={variants[status] || "outline"}>{status}</Badge>
}

export default function FeedPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [stats, setStats] = useState<FeedStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isTriggering, setIsTriggering] = useState<string | null>(null)

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
      loadData()
    }
  }, [user])

  async function loadData() {
    setIsLoading(true)
    try {
      const response = await feedApi.stats()
      if (response.success) {
        setStats(response.data as FeedStats)
      } else {
        toast.error(response.error || "Failed to load feed data")
      }
    } catch (error) {
      console.error("Failed to load feed data:", error)
      toast.error("Failed to load feed data")
    } finally {
      setIsLoading(false)
    }
  }

  async function triggerScoring(type: "forYou" | "feed") {
    setIsTriggering(type)
    try {
      const queue = type === "forYou" ? "forYouScoring" : "feedScoring"
      const job = type === "forYou" ? "forYouScoring" : "feedScoring"
      const response = await jobsApi.trigger(queue, job)
      
      if (response.success) {
        toast.success(
          `${type === "forYou" ? "ForYou" : "Feed"} scoring job triggered successfully`
        )
        // Recharger les données après 2 secondes
        setTimeout(loadData, 2000)
      } else {
        toast.error(response.error || "Failed to trigger job")
      }
    } catch (error) {
      toast.error("Failed to trigger job")
    } finally {
      setIsTriggering(null)
    }
  }

  // Loading state
  if (isLoading || authLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  // Auth check
  if (!user || user.role !== "ADMIN") {
    return null
  }

  return (
    <div>
      <AdminHeader
        title="Feed & ForYou"
        description="Video commerce and personalization analytics"
      />

      <div className="p-6 space-y-6">
        {/* Stats Cards avec liens */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Link href={`${adminPath}/videos`} className="block">
            <StatsCard
              title="Total Videos"
              value={formatNumber(stats?.totalVideos ?? 0)}
              icon={Video}
              description="Active video products"
              className="cursor-pointer hover:shadow-lg transition-shadow"
            />
          </Link>
          
          <Link href={`${adminPath}/analytics/views`} className="block">
            <StatsCard
              title="Total Views"
              value={formatNumber(stats?.totalViews ?? 0)}
              icon={Eye}
              description="All-time video views"
              className="cursor-pointer hover:shadow-lg transition-shadow"
            />
          </Link>
          
          <Link href={`${adminPath}/analytics/engagement`} className="block">
            <StatsCard
              title="Total Likes"
              value={formatNumber(stats?.totalLikes ?? 0)}
              icon={Heart}
              description="Video engagements"
              className="cursor-pointer hover:shadow-lg transition-shadow"
            />
          </Link>
        </div>

        {/* Scoring Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>Recommendation Scoring</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Run scoring jobs to update personalized recommendations for users based on their viewing history and engagement patterns.
            </p>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => triggerScoring("forYou")} 
                disabled={isTriggering !== null}
              >
                <Sparkles className={`mr-2 h-4 w-4 ${isTriggering === 'forYou' ? 'animate-spin' : ''}`} />
                {isTriggering === 'forYou' ? 'Running...' : 'Run ForYou Scoring'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => triggerScoring("feed")}
                disabled={isTriggering !== null}
              >
                <Play className={`mr-2 h-4 w-4 ${isTriggering === 'feed' ? 'animate-spin' : ''}`} />
                {isTriggering === 'feed' ? 'Running...' : 'Run Feed Scoring'}
              </Button>
            </div>

            {/* Recent Jobs */}
            {stats?.recentJobs && stats.recentJobs.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Recent Jobs</h4>
                <div className="space-y-2">
                  {stats.recentJobs.map((job) => (
                    <Link
                      key={job.id}
                      href={`${adminPath}/jobs/${job.id}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{job.name}</span>
                      </div>
                      {getJobStatusBadge(job.status)}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Videos - CORRIGÉ : plus de liens imbriqués */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Videos</CardTitle>
          </CardHeader>
          <CardContent>
            {stats?.topVideos?.length ? (
              <div className="space-y-4">
                {stats.topVideos.map((video, index) => (
                  <div
                    key={video.id}
                    className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    {/* Rang */}
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary shrink-0">
                      #{index + 1}
                    </div>

                    {/* Miniature cliquable -> vidéo */}
                    <Link 
                      href={`${adminPath}/videos/${video.id}`}
                      className="shrink-0"
                    >
                      <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden">
                        {video.product.images?.[0] ? (
                          <img 
                            src={video.product.images[0]} 
                            alt={video.product.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center">
                            <Film className="h-5 w-5 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Infos principales */}
                    <div className="flex-1 min-w-0">
                      {/* Titre du produit cliquable -> produit */}
                      <Link 
                        href={`${adminPath}/products/${video.product.id}`}
                        className="font-medium hover:text-primary hover:underline block truncate"
                      >
                        {video.product.title}
                      </Link>
                      
                      {/* Stats cliquables -> vidéo */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                        <Link 
                          href={`${adminPath}/videos/${video.id}`}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <Eye className="h-4 w-4" />
                          {formatNumber(video.viewCount)}
                        </Link>
                        <Link 
                          href={`${adminPath}/videos/${video.id}`}
                          className="flex items-center gap-1 hover:text-primary"
                        >
                          <Heart className="h-4 w-4" />
                          {formatNumber(video.likeCount)}
                        </Link>
                        {video.video?.duration && (
                          <span className="flex items-center gap-1">
                            <Play className="h-4 w-4" />
                            {Math.floor(video.video.duration / 60)}:{(video.video.duration % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Engagement Rate */}
                    <Badge variant="outline" className="ml-auto shrink-0">
                      {((video.likeCount / (video.viewCount || 1)) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No video data available</p>
                <Button variant="outline" className="mt-4" asChild>
                  <Link href={`${adminPath}/videos/new`}>
                    Add Your First Video
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions avec lien vers For You Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-4">
              <Button variant="outline" className="justify-start" asChild>
                <Link href={`${adminPath}/videos`}>
                  <Video className="mr-2 h-4 w-4" />
                  Manage Videos
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href={`${adminPath}/analytics/feed`}>
                  <TrendingUp className="mr-2 h-4 w-4" />
                  Detailed Analytics
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href={`${adminPath}/analytics/foryou`}>
                  <Sparkles className="mr-2 h-4 w-4" />
                  For You Analytics
                </Link>
              </Button>
              <Button variant="outline" className="justify-start" asChild>
                <Link href={`${adminPath}/users?segment=active`}>
                  <User className="mr-2 h-4 w-4" />
                  Active Users
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin/header"
import { StatsCard } from "@/components/admin/stats-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuth } from "@/lib/admin/auth-context"
import { chatFeedbackApi, type ChatFeedbackItem, type ChatFeedbackStats } from "@/lib/admin/api-client"
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  Smile,
  Meh,
  Frown,
  ChevronLeft,
  ChevronRight,
  User as UserIcon,
} from "lucide-react"

// ============================================================
// FONCTIONS UTILITAIRES
// ============================================================

function sentimentBadge(sentiment: string) {
  switch (sentiment) {
    case "positive":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 gap-1">
          <Smile className="h-3 w-3" /> Positif
        </Badge>
      )
    case "negative":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 gap-1">
          <Frown className="h-3 w-3" /> Négatif
        </Badge>
      )
    default:
      return (
        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 gap-1">
          <Meh className="h-3 w-3" /> Neutre
        </Badge>
      )
  }
}

function typeBadge(type: string) {
  return type === "post_purchase" ? (
    <Badge variant="outline" className="text-[10px]">Post-achat</Badge>
  ) : (
    <Badge variant="outline" className="text-[10px]">Expérience</Badge>
  )
}

function RatingStars({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${i <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
        />
      ))}
    </div>
  )
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================

export default function ChatFeedbackPage() {
  const [items, setItems] = useState<ChatFeedbackItem[]>([])
  const [stats, setStats] = useState<ChatFeedbackStats | null>(null)
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 })
  const [isLoading, setIsLoading] = useState(true)
  const [sentimentFilter, setSentimentFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const loadData = useCallback(async (targetPage: number) => {
    setIsLoading(true)
    try {
      const res = await chatFeedbackApi.list({
        page: targetPage,
        limit: 20,
        sentiment: sentimentFilter !== "all" ? sentimentFilter : undefined,
        type: typeFilter !== "all" ? typeFilter : undefined,
      })
      if (res.success) {
        setItems(res.items)
        setStats(res.stats)
        setPagination(res.pagination)
      }
    } catch (err) {
      console.error("Failed to load chat feedback:", err)
    } finally {
      setIsLoading(false)
    }
  }, [sentimentFilter, typeFilter])

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
      loadData(page)
    }
  }, [authLoading, user, router, page, loadData])

  // Revenir à la page 1 quand un filtre change
  useEffect(() => {
    setPage(1)
  }, [sentimentFilter, typeFilter])

  if (isLoading && items.length === 0) {
    return (
      <div className="p-10 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <AdminHeader
        title="Chat Feedback"
        description="Satisfaction et expérience collectées conversationnellement par le chatbot"
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Taux de satisfaction"
          value={stats?.satisfactionRate !== null && stats?.satisfactionRate !== undefined ? `${stats.satisfactionRate}%` : "—"}
          description={`${stats?.total ?? 0} avis au total`}
          icon={Smile}
        />
        <StatsCard
          title="Taux de recommandation"
          value={stats?.recommendRate !== null && stats?.recommendRate !== undefined ? `${stats.recommendRate}%` : "—"}
          description={`${(stats?.recommendYes ?? 0)} oui / ${(stats?.recommendNo ?? 0)} non`}
          icon={ThumbsUp}
        />
        <StatsCard
          title="Note moyenne"
          value={stats?.avgRating !== null && stats?.avgRating !== undefined ? `${stats.avgRating} / 5` : "—"}
          description={`${stats?.ratingCount ?? 0} note(s)`}
          icon={Star}
        />
        <StatsCard
          title="Répartition"
          value={`${stats?.positive ?? 0} / ${stats?.neutral ?? 0} / ${stats?.negative ?? 0}`}
          description="Positif / Neutre / Négatif"
          icon={Meh}
        />
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2">
        <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Sentiment" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les sentiments</SelectItem>
            <SelectItem value="positive">Positif</SelectItem>
            <SelectItem value="neutral">Neutre</SelectItem>
            <SelectItem value="negative">Négatif</SelectItem>
          </SelectContent>
        </Select>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="post_purchase">Post-achat</SelectItem>
            <SelectItem value="experience">Expérience</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liste */}
      <Card>
        <CardHeader>
          <CardTitle>Avis récents</CardTitle>
          <CardDescription>
            {pagination.total} résultat{pagination.total > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3 border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {sentimentBadge(item.sentiment)}
                      {typeBadge(item.feedbackType)}
                      <RatingStars rating={item.rating} />
                      {item.wouldRecommend !== null && (
                        item.wouldRecommend ? (
                          <Badge variant="outline" className="gap-1 text-[10px] text-green-700 border-green-200">
                            <ThumbsUp className="h-3 w-3" /> Recommande
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-[10px] text-red-700 border-red-200">
                            <ThumbsDown className="h-3 w-3" /> Ne recommande pas
                          </Badge>
                        )
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(item.createdAt)}</span>
                  </div>

                  <p className="text-sm">{item.rawMessage}</p>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <UserIcon className="h-3 w-3" />
                    {item.user ? `${item.user.name} (${item.user.email})` : "Visiteur anonyme"}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-8">Aucun feedback pour ce filtre</p>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <span className="text-xs text-muted-foreground">
                Page {pagination.page} sur {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Précédent
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                >
                  Suivant <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

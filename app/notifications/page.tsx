"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Bell, Check, Trash2, RefreshCw, Clock, Package, Truck, CreditCard, Star, MessageCircle, Eye } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/lib/admin/auth-context"
import { useApi } from "@/hooks/useApi"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"

// Types
interface Notification {
  id: string
  title: string
  message: string
  type: 'order' | 'shipping' | 'payment' | 'promotion' | 'review' | 'sourcing' | 'system'
  read: boolean
  createdAt: string
  link?: string
  metadata?: any
}

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const { fetchWithAuth } = useApi()
  
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [stats, setStats] = useState({
    total: 0,
    unread: 0
  })

  // ✅ Charger les notifications
  const loadNotifications = useCallback(async (pageToLoad: number, reset = false) => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', pageToLoad.toString())
      params.append('limit', '20')
      if (filter === 'unread') params.append('unread', 'true')
      
      const response = await fetchWithAuth(`/api/notifications?${params.toString()}`)
      const data = await response.json()
      
      if (data.success) {
        if (reset) {
          setNotifications(data.data)
        } else {
          setNotifications(prev => [...prev, ...data.data])
        }
        setHasMore(data.meta?.hasMore || false)
        setStats({
          total: data.meta?.total || 0,
          unread: data.meta?.unread || 0
        })
        setPage(pageToLoad + 1)
      } else {
        toast.error(data.error || "Erreur chargement")
      }
    } catch (error) {
      console.error("❌ Erreur chargement notifications:", error)
      toast.error("Erreur de chargement")
    } finally {
      setIsLoading(false)
    }
  }, [user, fetchWithAuth, filter])

  // ✅ Marquer comme lu
  const markAsRead = useCallback(async (id: string) => {
    try {
      const response = await fetchWithAuth(`/api/notifications/${id}/read`, {
        method: 'PATCH',
        body: JSON.stringify({ read: true })
      })
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => n.id === id ? { ...n, read: true } : n)
        )
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - 1)
        }))
      }
    } catch (error) {
      console.error("❌ Erreur marquage lu:", error)
    }
  }, [fetchWithAuth])

  // ✅ Marquer tout comme lu
  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetchWithAuth('/api/notifications/read-all', {
        method: 'POST'
      })
      
      if (response.ok) {
        setNotifications(prev =>
          prev.map(n => ({ ...n, read: true }))
        )
        setStats(prev => ({
          ...prev,
          unread: 0
        }))
        toast.success("Toutes les notifications marquées comme lues")
      }
    } catch (error) {
      console.error("❌ Erreur marquage tout lu:", error)
      toast.error("Erreur lors du marquage")
    }
  }, [fetchWithAuth])

  // ✅ Supprimer une notification
  const deleteNotification = useCallback(async (id: string) => {
    try {
      const response = await fetchWithAuth(`/api/notifications/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        const deleted = notifications.find(n => n.id === id)
        setNotifications(prev => prev.filter(n => n.id !== id))
        if (!deleted?.read) {
          setStats(prev => ({
            ...prev,
            unread: Math.max(0, prev.unread - 1),
            total: prev.total - 1
          }))
        } else {
          setStats(prev => ({
            ...prev,
            total: prev.total - 1
          }))
        }
        toast.success("Notification supprimée")
      }
    } catch (error) {
      console.error("❌ Erreur suppression:", error)
      toast.error("Erreur lors de la suppression")
    }
  }, [fetchWithAuth, notifications])

  // ✅ Recharger les notifications
  const refreshNotifications = useCallback(() => {
    setPage(1)
    setHasMore(true)
    loadNotifications(1, true)
  }, [loadNotifications])

  // ✅ Chargement initial
  useEffect(() => {
    if (user) {
      refreshNotifications()
    }
  }, [user, filter, refreshNotifications])

  // ✅ Récupérer l'icône selon le type
  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'order':
        return <Package className="w-5 h-5 text-blue-500" />
      case 'shipping':
        return <Truck className="w-5 h-5 text-green-500" />
      case 'payment':
        return <CreditCard className="w-5 h-5 text-purple-500" />
      case 'promotion':
        return <Star className="w-5 h-5 text-yellow-500" />
      case 'review':
        return <MessageCircle className="w-5 h-5 text-pink-500" />
      case 'sourcing':
        return <Clock className="w-5 h-5 text-orange-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  // ✅ Formater la date
  const formatDate = (date: string) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60))
        return `il y a ${minutes} minute${minutes > 1 ? 's' : ''}`
      }
      return `il y a ${hours} heure${hours > 1 ? 's' : ''}`
    }
    if (days === 1) return 'hier'
    if (days < 7) return `il y a ${days} jours`
    return format(d, "dd MMM yyyy", { locale: fr })
  }

  // ✅ Scroll infini
  useEffect(() => {
    if (!hasMore || isLoading || !user) return
    
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      
      if (scrollTop + clientHeight >= scrollHeight - 200) {
        loadNotifications(page, false)
      }
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [hasMore, isLoading, page, loadNotifications, user])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-light">
        <div className="hidden lg:block"><Header /></div>
        <div className="lg:hidden"><MobileHeader /></div>
        
        <main className="max-w-[1440px] mx-auto px-4 lg:px-6 py-12">
          <div className="text-center py-12">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Connectez-vous</h2>
            <p className="text-gray-500 mb-6">
              Connectez-vous pour voir vos notifications
            </p>
            <a
              href="/account?mode=login"
              className="inline-block px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand-dark transition-colors"
            >
              Se connecter
            </a>
          </div>
        </main>
        
        <Footer />
        <div className="lg:hidden"><MobileNav /></div>
      </div>
    )
  }

  const filteredNotifications = notifications.filter(n => 
    filter === 'all' || !n.read
  )

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="hidden lg:block">
        <Header />
      </div>
      <div className="lg:hidden">
        <MobileHeader />
      </div>

      <main className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6 pb-20 lg:pb-8">
        {/* Header avec stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand" />
            Notifications
            {stats.unread > 0 && (
              <span className="bg-brand text-white text-sm px-2 py-0.5 rounded-full">
                {stats.unread}
              </span>
            )}
          </h1>
          
          <div className="flex items-center gap-3">
            {/* Filtres */}
            <div className="flex bg-white rounded-lg shadow-sm p-1">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === 'all'
                    ? 'bg-brand text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === 'unread'
                    ? 'bg-brand text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Non lues
                {stats.unread > 0 && (
                  <span className="ml-1 text-xs">({stats.unread})</span>
                )}
              </button>
            </div>
            
            {/* Actions */}
            <button
              onClick={refreshNotifications}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Actualiser"
            >
              <RefreshCw className="w-5 h-5" />
            </button>
            
            {stats.unread > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-1.5 text-sm text-brand hover:bg-brand/10 rounded-lg transition-colors flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Tout lire
              </button>
            )}
          </div>
        </div>

        {/* Liste des notifications */}
        {isLoading && notifications.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {filter === 'unread' 
                ? "Vous n'avez aucune notification non lue" 
                : "Vous n'avez aucune notification"}
            </p>
            {filter === 'unread' && (
              <button
                onClick={() => setFilter('all')}
                className="mt-4 text-brand hover:underline text-sm"
              >
                Voir toutes les notifications
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  !notification.read ? 'border-l-4 border-brand' : 'opacity-80'
                }`}
                onClick={() => !notification.read && markAsRead(notification.id)}
              >
                <div className="p-4 flex gap-4">
                  {/* Icône */}
                  <div className="flex-shrink-0">
                    {getIcon(notification.type)}
                  </div>
                  
                  {/* Contenu */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {notification.message}
                    </p>
                    {notification.link && (
                      <a
                        href={notification.link}
                        className="inline-flex items-center gap-1 text-xs text-brand hover:underline mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="w-3 h-3" />
                        Voir les détails
                      </a>
                    )}
                  </div>
                  
                  {/* Actions */}
                  <div className="flex-shrink-0 flex items-start gap-1">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        className="p-1 text-gray-400 hover:text-green-600 rounded"
                        title="Marquer comme lu"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotification(notification.id)
                      }}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loader pour scroll infini */}
        {isLoading && notifications.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
          </div>
        )}
        
        {/* Fin de liste */}
        {!hasMore && notifications.length > 0 && (
          <p className="text-center text-xs text-gray-400 py-4">
            Fin des notifications
          </p>
        )}
      </main>

      <Footer />
      <div className="lg:hidden">
        <MobileNav />
      </div>
    </div>
  )
}
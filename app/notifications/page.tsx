"use client"

import { Header } from "@/components/header"
import { MobileHeader } from "@/components/mobile-header"
import MobileNav from "@/components/mobile-nav"
import { Footer } from "@/components/footer"
import { Bell, Check, Trash2, RefreshCw } from "lucide-react"
import { useState, useEffect, useCallback, useRef } from "react"
import { useAuth } from "@/lib/admin/auth-context"
import { useApi } from "@/hooks/useApi"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { toast } from "sonner"

interface Notification {
  id: string
  title: string
  message: string
  type: string
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
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const loadNotifications = useCallback(async (pageToLoad: number, reset = false) => {
    if (!user) return
    
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      params.append('page', pageToLoad.toString())
      params.append('limit', '20')
      if (filter === 'unread') params.append('unread', 'true')
      
      const response = await fetchWithAuth(`/api/notifications?${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        const responseData = result.data || result
        
        let newNotifications: Notification[] = []
        let paginationData = {}
        let statsData = {}
        
        if (responseData && typeof responseData === 'object') {
          if (responseData.data && Array.isArray(responseData.data)) {
            newNotifications = responseData.data
            paginationData = responseData.pagination || {}
            statsData = responseData.stats || {}
          } 
          else if (Array.isArray(responseData)) {
            newNotifications = responseData
          }
          else if (responseData.notifications && Array.isArray(responseData.notifications)) {
            newNotifications = responseData.notifications
            paginationData = responseData.pagination || {}
            statsData = responseData.stats || {}
          }
          else if (Array.isArray(result.data)) {
            newNotifications = result.data
          }
        }
        
        if (reset) {
          setNotifications(newNotifications)
        } else {
          setNotifications(prev => [...prev, ...newNotifications])
        }
        
        setHasMore(paginationData.hasMore || false)
        setUnreadCount(statsData.unread || 0)
        setPage(pageToLoad + 1)
      } else {
        toast.error(result.error || "Erreur chargement")
      }
    } catch (error) {
      console.error("❌ Erreur chargement notifications:", error)
      toast.error("Erreur de chargement")
    } finally {
      setIsLoading(false)
    }
  }, [user, fetchWithAuth, filter])

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
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("❌ Erreur marquage lu:", error)
    }
  }, [fetchWithAuth])

  const refreshNotifications = useCallback(() => {
    setPage(1)
    setHasMore(true)
    loadNotifications(1, true)
  }, []) // ← Dépendances vides pour éviter boucle infinie

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await fetchWithAuth('/api/notifications', {
        method: 'POST'
      })
      
      if (response.ok) {
        refreshNotifications()
        toast.success("Toutes les notifications marquées comme lues")
      } else {
        toast.error("Erreur lors du marquage")
      }
    } catch (error) {
      console.error("❌ Erreur marquage tout lu:", error)
      toast.error("Erreur lors du marquage")
    }
  }, [fetchWithAuth, refreshNotifications])

  const deleteNotification = useCallback(async (id: string) => {
    try {
      const response = await fetchWithAuth(`/api/notifications/${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        const deleted = notifications.find(n => n.id === id)
        setNotifications(prev => prev.filter(n => n.id !== id))
        if (!deleted?.read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
        toast.success("Notification supprimée")
      }
    } catch (error) {
      console.error("❌ Erreur suppression:", error)
      toast.error("Erreur lors de la suppression")
    }
  }, [fetchWithAuth, notifications])

  // 🔥 MARQUAGE AUTO DES NOTIFICATIONS VISIBLES (SCROLL)
  useEffect(() => {
    if (!notifications.length) return;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('data-notif-id');
            const notification = notifications.find(n => n.id === id);
            if (notification && !notification.read) {
              markAsRead(id!);
            }
            observerRef.current?.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const elements = document.querySelectorAll('[data-notif-id]');
    elements.forEach(el => observerRef.current?.observe(el));
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [notifications, markAsRead]);

  // 🔥 RECHARGEMENT QUAND L'UTILISATEUR REVIENT SUR L'ONGLET
  useEffect(() => {
    if (!user) return;
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshNotifications();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user, refreshNotifications]);

  // Chargement initial
  useEffect(() => {
    if (user) {
      refreshNotifications()
    }
  }, [user, filter]) // Seulement quand user ou filter change

  // Scroll infini
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
            <p className="text-gray-500 mb-6">Connectez-vous pour voir vos notifications</p>
            <a href="/account?mode=login" className="inline-block px-6 py-3 bg-brand text-white rounded-lg">
              Se connecter
            </a>
          </div>
        </main>
        <Footer />
        <div className="lg:hidden"><MobileNav /></div>
      </div>
    )
  }

  const filteredNotifications = notifications.filter(n => filter === 'all' || !n.read)

  return (
    <div className="min-h-screen bg-neutral-light">
      <div className="hidden lg:block"><Header /></div>
      <div className="lg:hidden"><MobileHeader /></div>

      <main className="max-w-[1440px] mx-auto px-4 lg:px-6 py-6 pb-20 lg:pb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-brand" />
            Notifications
            {unreadCount > 0 && (
              <span className="bg-brand text-white text-sm px-2 py-0.5 rounded-full">{unreadCount}</span>
            )}
          </h1>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-white rounded-lg shadow-sm p-1">
              <button 
                onClick={() => setFilter('all')} 
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === 'all' ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Toutes
              </button>
              <button 
                onClick={() => setFilter('unread')} 
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  filter === 'unread' ? 'bg-brand text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Non lues {unreadCount > 0 && <span className="ml-1 text-xs">({unreadCount})</span>}
              </button>
            </div>
            
            <button onClick={refreshNotifications} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
              <RefreshCw className="w-5 h-5" />
            </button>
            
            {unreadCount > 0 && (
              <button onClick={markAllAsRead} className="px-3 py-1.5 text-sm text-brand hover:bg-brand/10 rounded-lg flex items-center gap-1">
                <Check className="w-4 h-4" /> Tout lire
              </button>
            )}
          </div>
        </div>

        {isLoading && notifications.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand"></div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">
              {filter === 'unread' ? "Aucune notification non lue" : "Aucune notification"}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                data-notif-id={notification.id}
                className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all cursor-pointer ${
                  !notification.read ? 'border-l-4 border-brand' : 'opacity-80'
                }`}
              >
                <div className="p-4 flex gap-4">
                  <div className="flex-shrink-0">
                    <Bell className="w-5 h-5 text-gray-500" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-600'}`}>
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {format(new Date(notification.createdAt), "dd MMM yyyy", { locale: fr })}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                  </div>
                  
                  <div className="flex-shrink-0 flex items-start gap-1">
                    {!notification.read && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(notification.id)
                        }}
                        className="p-1 text-gray-400 hover:text-green-600 rounded"
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
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {isLoading && notifications.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-brand"></div>
          </div>
        )}
      </main>

      <Footer />
      <div className="lg:hidden"><MobileNav /></div>
    </div>
  )
}
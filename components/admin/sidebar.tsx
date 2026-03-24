"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Import,
  Video,
  Bell,
  Cog,
  LogOut,
  Users,
  FolderTree,
  Sparkles,
  Activity,
  TrendingUp,
  Heart,
  Eye,
  ChevronDown,
  ChevronRight,
  Settings,
  Shield,
  HelpCircle,
  Brain,
  Target,
  Palette,
  ScrollText,
  UserPlus,
  // ✅ AJOUT : Icône pour Sourcing
  FileSearch,
  MessageCircle,
  Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/admin/auth-context"
import { useState } from "react"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

// Navigation data
const mainNavigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, end: true },
  { name: "Products", href: "/admin/dashboard/products", icon: Package },
  { name: "Categories", href: "/admin/dashboard/categories", icon: FolderTree },
  { name: "Orders", href: "/admin/dashboard/orders", icon: ShoppingCart },
  { name: "Imports", href: "/admin/dashboard/imports", icon: Import },
]

// ✅ NOUVEAU : Sourcing Navigation
const sourcingNavigation = [
  { name: "Demandes", href: "/admin/dashboard/sourcing", icon: FileSearch, badge: "New" },
  { name: "Traitement", href: "/admin/dashboard/sourcing/pending", icon: Clock },
  { name: "Réponses", href: "/admin/dashboard/sourcing/responses", icon: MessageCircle },
]

const contentNavigation = [
  { name: "Videos", href: "/admin/dashboard/videos", icon: Video },
  { name: "Feed", href: "/admin/dashboard/feed", icon: Sparkles },
  { name: "Notifications", href: "/admin/dashboard/notifications", icon: Bell },
]

const iaNavigation = [
  { name: "Cycle Vertueux", href: "/admin/dashboard/ia/cycle", icon: Brain, badge: "Live" },
  { name: "Qualité", href: "/admin/dashboard/ia/quality", icon: Target },
  { name: "Cold Start", href: "/admin/dashboard/ia/coldstart", icon: UserPlus },
  { name: "Diversité", href: "/admin/dashboard/ia/diversity", icon: Palette },
  { name: "Scroll Infini", href: "/admin/dashboard/ia/scroll", icon: ScrollText },
  { name: "Performance", href: "/admin/dashboard/ia/performance", icon: Activity, badge: "Beta" },
]

const analyticsNavigation = [
  { name: "Views", href: "/admin/dashboard/analytics/views", icon: Eye },
  { name: "Engagement", href: "/admin/dashboard/analytics/engagement", icon: Heart },
  { name: "For You", href: "/admin/dashboard/analytics/foryou", icon: Sparkles, badge: "New" },
  { name: "Feed Analytics", href: "/admin/dashboard/analytics/feed", icon: TrendingUp },
]

const systemNavigation = [
  { name: "Jobs", href: "/admin/dashboard/jobs", icon: Activity },
  { name: "Users", href: "/admin/dashboard/users", icon: Users },
  { name: "Settings", href: "/admin/dashboard/settings", icon: Cog },
]

interface NavItemProps {
  item: {
    name: string
    href: string
    icon: React.ElementType
    badge?: string
    end?: boolean
  }
  isActive: boolean
}

function NavItem({ item, isActive }: NavItemProps) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center justify-between gap-3 rounded-lg px-3 py-1.5 text-sm transition-all",
        isActive
          ? "bg-primary text-primary-foreground font-medium"
          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <div className="flex items-center gap-3">
        <item.icon className="h-4 w-4" />
        <span>{item.name}</span>
      </div>
      {item.badge && (
        <Badge variant="secondary" className={cn(
          "text-[10px] h-4 px-1",
          isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
        )}>
          {item.badge}
        </Badge>
      )}
    </Link>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(true)
  const [isIaOpen, setIsIaOpen] = useState(true)
  const [isSourcingOpen, setIsSourcingOpen] = useState(true) // ✅ NOUVEAU

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="h-14 flex items-center gap-2 border-b px-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-sm">
          A
        </div>
        <span className="text-base font-semibold">Adullam</span>
        <Badge variant="outline" className="ml-auto text-[9px] h-4 px-1">
          v3.0
        </Badge>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-3 py-3 scrollbar-none">
          <nav className="space-y-4">
            {/* Main */}
            <div className="space-y-0.5">
              <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Main
              </p>
              {mainNavigation.map((item) => {
                const isActive = item.end 
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
                return <NavItem key={item.name} item={item} isActive={isActive} />
              })}
            </div>

            <Separator className="my-2" />

            {/* ✅ NOUVEAU : Sourcing Section */}
            <div className="space-y-0.5">
              <Collapsible open={isSourcingOpen} onOpenChange={setIsSourcingOpen}>
                <div className="flex items-center justify-between px-3 mb-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Sourcing
                  </p>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      {isSourcingOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-0.5">
                  {sourcingNavigation.map((item) => (
                    <NavItem
                      key={item.name}
                      item={item}
                      isActive={pathname.startsWith(item.href)}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>

            <Separator className="my-2" />

            {/* IA */}
            <div className="space-y-0.5">
              <Collapsible open={isIaOpen} onOpenChange={setIsIaOpen}>
                <div className="flex items-center justify-between px-3 mb-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    IA
                  </p>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      {isIaOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-0.5">
                  {iaNavigation.map((item) => (
                    <NavItem
                      key={item.name}
                      item={item}
                      isActive={pathname.startsWith(item.href)}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>

            <Separator className="my-2" />

            {/* Content */}
            <div className="space-y-0.5">
              <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                Content
              </p>
              {contentNavigation.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  isActive={pathname.startsWith(item.href)}
                />
              ))}
            </div>

            <Separator className="my-2" />

            {/* Analytics */}
            <div className="space-y-0.5">
              <Collapsible open={isAnalyticsOpen} onOpenChange={setIsAnalyticsOpen}>
                <div className="flex items-center justify-between px-3 mb-1">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Analytics
                  </p>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-5 w-5">
                      {isAnalyticsOpen ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="space-y-0.5">
                  {analyticsNavigation.map((item) => (
                    <NavItem
                      key={item.name}
                      item={item}
                      isActive={pathname.startsWith(item.href)}
                    />
                  ))}
                </CollapsibleContent>
              </Collapsible>
            </div>

            <Separator className="my-2" />

            {/* System */}
            <div className="space-y-0.5">
              <p className="px-3 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                System
              </p>
              {systemNavigation.map((item) => (
                <NavItem
                  key={item.name}
                  item={item}
                  isActive={pathname.startsWith(item.href)}
                />
              ))}
            </div>
          </nav>
        </div>
      </div>

      {/* User Menu */}
      <div className="border-t p-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-2 px-2 h-auto py-1.5">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                  {user?.name?.charAt(0)?.toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 truncate text-left">
                <p className="text-xs font-medium truncate">{user?.name || "Admin"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-xs">Mon compte</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className="text-xs">
              <Link href="/admin/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="text-xs">
              <Link href="/admin/dashboard/settings">Paramètres</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout} className="text-destructive text-xs">
              <LogOut className="mr-2 h-3 w-3" />
              Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help & Privacy */}
        <div className="mt-2 flex items-center justify-between">
          <Button variant="ghost" size="sm" className="h-6 px-1 text-[10px]" asChild>
            <Link href="/admin/dashboard/help">
              <HelpCircle className="h-3 w-3 mr-1" />
              Aide
            </Link>
          </Button>
          <Button variant="ghost" size="sm" className="h-6 px-1 text-[10px]" asChild>
            <Link href="/admin/dashboard/settings">
              <Shield className="h-3 w-3 mr-1" />
              Confidentialité
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
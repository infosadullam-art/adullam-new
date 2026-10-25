import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  FileSearch,
  Package,
  FolderTree,
  Import,
  Video,
  Bell,
  Star,
  Brain,
  Target,
  UserPlus,
  Palette,
  ScrollText,
  Activity,
  Cog,
  Ticket,
  type LucideIcon,
} from "lucide-react"

export interface NavItem {
  name: string
  href: string
  icon: LucideIcon
  end?: boolean
}
export interface NavGroup {
  title: string
  items: NavItem[]
  collapsed?: boolean
}

const base = "/admin/dashboard"

export const NAV_GROUPS: NavGroup[] = [
  {
    title: "Ventes",
    items: [
      { name: "Accueil", href: base, icon: LayoutDashboard, end: true },
      { name: "Commandes", href: `${base}/orders`, icon: ShoppingCart },
      { name: "Clients", href: `${base}/users`, icon: Users },
      { name: "Demandes sourcing", href: `${base}/sourcing`, icon: FileSearch },
      { name: "Coupons", href: `${base}/coupons`, icon: Ticket },
    ],
  },
  {
    title: "Catalogue",
    items: [
      { name: "Produits", href: `${base}/products`, icon: Package },
      { name: "Catégories", href: `${base}/categories`, icon: FolderTree },
      { name: "Imports", href: `${base}/imports`, icon: Import },
    ],
  },
  {
    title: "Contenu",
    items: [
      { name: "Vidéos", href: `${base}/videos`, icon: Video },
      { name: "Notifications", href: `${base}/notifications`, icon: Bell },
      { name: "Avis sur Adu", href: `${base}/chat-feedback`, icon: Star },
    ],
  },
  {
    title: "Intelligence IA",
    items: [{ name: "Recommandations", href: `${base}/ia`, icon: Brain, end: true }],
  },
  {
    title: "Système",
    items: [
      { name: "Tâches", href: `${base}/jobs`, icon: Activity },
      { name: "Paramètres", href: `${base}/settings`, icon: Cog },
    ],
  },
]

// 4 raccourcis dans la barre du bas, le reste dans « Plus »
export const NAV_BOTTOM: NavItem[] = [
  NAV_GROUPS[0].items[0],
  NAV_GROUPS[0].items[1],
  NAV_GROUPS[0].items[3],
  NAV_GROUPS[1].items[0],
]

export function isActive(pathname: string, item: NavItem) {
  return item.end ? pathname === item.href : pathname.startsWith(item.href)
}

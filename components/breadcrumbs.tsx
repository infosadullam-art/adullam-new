"use client"

import { ChevronRight } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Breadcrumbs() {
  const pathname = usePathname()

  // Generate breadcrumbs based on pathname
  const getBreadcrumbs = () => {
    if (pathname === "/cart") {
      return [
        { label: "Accueil", href: "/" },
        { label: "Panier", href: "/cart" },
      ]
    }
    if (pathname?.startsWith("/product/")) {
      return [
        { label: "Accueil", href: "/" },
        { label: "Électronique", href: "/category/electronique" },
        { label: "Écouteurs sans fil", href: "#" },
      ]
    }
    return [{ label: "Accueil", href: "/" }]
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <nav className="flex items-center gap-2 text-sm py-4 overflow-x-auto">
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium truncate">{crumb.label}</span>
          ) : (
            <Link
              href={crumb.href}
              className="text-muted-foreground hover:text-brand transition-colors whitespace-nowrap"
            >
              {crumb.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}

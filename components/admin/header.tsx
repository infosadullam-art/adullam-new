"use client"

import type React from "react"

import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface AdminHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
}

export function AdminHeader({ title, description, actions }: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background px-6">
      <div>
        <h1 className="text-xl font-semibold">{title}</h1>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search..." className="w-64 pl-9" />
        </div>
        <Button variant="outline" size="icon">
          <Bell className="h-4 w-4" />
        </Button>
        {actions}
      </div>
    </header>
  )
}

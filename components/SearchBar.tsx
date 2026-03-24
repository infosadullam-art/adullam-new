// components/SearchBar.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"

export function SearchBar() {
  const [query, setQuery] = useState("")
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }

  return (
    <form onSubmit={handleSearch} className="relative flex-1 max-w-2xl">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Rechercher un produit..."
        className="w-full pl-10 pr-4 py-2 border rounded-lg"
      />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <button type="submit" className="hidden">Rechercher</button>
    </form>
  )
}
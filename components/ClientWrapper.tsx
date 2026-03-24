"use client"

import { CartProvider } from "@/context/CartContext"
import React from "react"

export default function ClientWrapper({ children }: { children: React.ReactNode }) {
  return <CartProvider>{children}</CartProvider>
}

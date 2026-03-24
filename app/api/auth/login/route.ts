import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const backendUrl = process.env.NEXT_PUBLIC_API_URL
  
  const res = await fetch(`${backendUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(await request.json()),
    credentials: "include",
  })

  const data = await res.json()
  
  // Transmettre la réponse au frontend
  return NextResponse.json(data, { status: res.status })
}
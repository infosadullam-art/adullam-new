// frontend/app/api/auth/register/route.ts
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // 🔹 Récupérer toutes les données du formulaire
    const { name, email, password, phone } = await request.json()

    // 🔹 Validation minimale
    if (!name || !email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Le nom, l'email et le mot de passe sont requis" 
        },
        { status: 400 }
      )
    }

    // 🔹 Récupérer l'URL du backend
    const backendUrl = process.env.NEXT_PUBLIC_API_URL
    if (!backendUrl) {
      console.error("NEXT_PUBLIC_API_URL n'est pas configuré")
      return NextResponse.json(
        { 
          success: false, 
          message: "Configuration serveur incorrecte" 
        },
        { status: 500 }
      )
    }

    console.log("🔵 Envoi au backend:", { name, email, phone })

    // 🔹 Appel au backend
    const backendRes = await fetch(`${backendUrl}/auth/register`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify({ 
        name, 
        email, 
        password, 
        phone: phone || null // Inclure phone même s'il est vide
      }),
      credentials: "include",
    })

    // 🔹 Récupérer la réponse
    const backendData = await backendRes.json()
    
    console.log("🟢 Réponse du backend:", backendData)

    // 🔹 Transmettre les cookies si présents
    const response = NextResponse.json(
      {
        success: backendData.success,
        user: backendData.user || null,
        message: backendData.message || "Inscription réussie",
      },
      { status: backendRes.status }
    )

    // 🔹 Copier les cookies du backend si présents
    const setCookieHeader = backendRes.headers.get("set-cookie")
    if (setCookieHeader) {
      response.headers.set("set-cookie", setCookieHeader)
    }

    return response

  } catch (err: any) {
    console.error("🔴 Erreur inscription:", err)
    
    return NextResponse.json(
      { 
        success: false, 
        message: err.message || "Erreur lors de l'inscription" 
      },
      { status: 500 }
    )
  }
}
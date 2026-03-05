import { type NextRequest, NextResponse } from "next/server"

// Cache para armazenar resultados por 5 minutos
const cache = new Map<string, { result: string; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

// Lista de fotos de fallback para parecer mais realista
const FALLBACK_PHOTOS = [
  "https://i.postimg.cc/gcNd6QBM/img1.jpg",
  "https://randomuser.me/api/portraits/women/44.jpg",
  "https://randomuser.me/api/portraits/men/32.jpg",
  "https://randomuser.me/api/portraits/women/68.jpg",
  "https://randomuser.me/api/portraits/men/75.jpg",
]

function getRandomFallback(): string {
  return FALLBACK_PHOTOS[Math.floor(Math.random() * FALLBACK_PHOTOS.length)]
}

export async function POST(request: NextRequest) {
  // Fallback padrao caso a API falhe
  const fallbackPhoto = getRandomFallback()
  const fallbackPayload = {
    success: true,
    result: fallbackPhoto,
    is_photo_private: true,
  }

  try {
    const { phone, countryCode } = await request.json()

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        {
          status: 400,
          headers: { "Access-Control-Allow-Origin": "*" },
        },
      )
    }

    const cleanNumber = phone.replace(/\D/g, "")
    const cleanCountryCode = countryCode?.replace(/\D/g, "") || ""
    const fullPhone = cleanCountryCode + cleanNumber
    
    console.log("[v0] ========== WHATSAPP API ROUTE ==========")
    console.log("[v0] Phone received:", phone)
    console.log("[v0] Country code received:", countryCode)
    console.log("[v0] Full phone number:", fullPhone)

    // Verifica cache
    const cached = cache.get(fullPhone)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log("[v0] Returning cached WhatsApp photo")
      return NextResponse.json(
        {
          success: true,
          result: cached.result,
          is_photo_private: false,
        },
        {
          status: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
        },
      )
    }

    // Tenta buscar da API RapidAPI
    const apiUrl = `https://whatsapp-data1.p.rapidapi.com/number/${fullPhone}`

    let photoUrl: string | null = null

    try {
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "x-rapidapi-key": "f575549d03mshca86c44dcf4b8b2p15d5ecjsn85e5e31470a0",
          "x-rapidapi-host": "whatsapp-data1.p.rapidapi.com",
        },
      })

      console.log("[v0] API Response status:", response.status)

      if (response.ok) {
        const responseText = await response.text()
        console.log("[v0] API Response (first 200 chars):", responseText.substring(0, 200))

        try {
          const jsonResponse = JSON.parse(responseText)
          photoUrl = jsonResponse.urlImage ||
                     jsonResponse.profile_pic || 
                     jsonResponse.profilePic || 
                     jsonResponse.picture || 
                     jsonResponse.photo || 
                     jsonResponse.url || 
                     jsonResponse.result
          console.log("[v0] Extracted photo URL:", photoUrl)
        } catch {
          console.log("[v0] Response is not JSON")
        }
      }
    } catch (fetchError) {
      console.error("[v0] Fetch error:", fetchError)
    }

    // Se nao conseguiu foto valida, usa fallback
    if (!photoUrl || !photoUrl.startsWith("http")) {
      console.log("[v0] No valid photo found, using fallback")
      
      // Armazena fallback no cache para este numero
      cache.set(fullPhone, {
        result: fallbackPhoto,
        timestamp: Date.now(),
      })
      
      return NextResponse.json(fallbackPayload, {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
      })
    }

    // Armazena no cache
    cache.set(fullPhone, {
      result: photoUrl.trim(),
      timestamp: Date.now(),
    })

    // Limita o tamanho do cache
    if (cache.size > 100) {
      const oldestKey = Array.from(cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0]
      cache.delete(oldestKey)
    }

    // Retorna a URL da foto de perfil
    return NextResponse.json(
      {
        success: true,
        result: photoUrl.trim(),
        is_photo_private: false,
      },
      {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
      },
    )
  } catch (error) {
    console.error("[v0] Erro na requisição:", error)
    return NextResponse.json(fallbackPayload, {
      status: 200,
      headers: { "Access-Control-Allow-Origin": "*" },
    })
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}

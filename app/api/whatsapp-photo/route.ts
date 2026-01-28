import { type NextRequest, NextResponse } from "next/server"

// Cache para armazenar resultados por 5 minutos
const cache = new Map<string, { result: string; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export async function POST(request: NextRequest) {
  // Fallback padrão caso a API falhe
  const fallbackPayload = {
    success: true,
    result: "https://i.postimg.cc/gcNd6QBM/img1.jpg",
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

    const apiUrl = `https://whatsapp-data1.p.rapidapi.com/number/${fullPhone}`

    let response: Response
    try {
      response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "x-rapidapi-key": "f575549d03mshca86c44dcf4b8b2p15d5ecjsn85e5e31470a0",
          "x-rapidapi-host": "whatsapp-data1.p.rapidapi.com",
        },
      })
    } catch (fetchError) {
      console.error("[v0] Fetch error:", fetchError)
      return NextResponse.json(fallbackPayload, {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
      })
    }

    console.log("[v0] API Response status:", response.status)

    // Tratamento de rate limit
    if (response.status === 429) {
      console.log("[v0] Rate limit exceeded, returning fallback")
      return NextResponse.json(fallbackPayload, {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
      })
    }

    // Verifica se a resposta foi bem-sucedida
    if (!response.ok) {
      console.error("[v0] Erro ao buscar foto:", response.status)
      return NextResponse.json(fallbackPayload, {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
      })
    }

    const responseText = await response.text()

    console.log("[v0] ========== RAPIDAPI RESPONSE ==========")
    console.log("[v0] API Response body (first 500 chars):", responseText.substring(0, 500))
    console.log("[v0] Full response length:", responseText.length)

    let photoUrl: string
    try {
      const jsonResponse = JSON.parse(responseText)
      // Try multiple possible field names from different API responses
      // urlImage is the field returned by whatsapp-data1.p.rapidapi.com
      photoUrl = jsonResponse.urlImage ||
                 jsonResponse.profile_pic || 
                 jsonResponse.profilePic || 
                 jsonResponse.picture || 
                 jsonResponse.photo || 
                 jsonResponse.url || 
                 jsonResponse.result || 
                 jsonResponse.photo_url ||
                 jsonResponse.data?.profile_pic ||
                 jsonResponse.data?.picture ||
                 jsonResponse.data?.urlImage
      console.log("[v0] Extracted photo URL:", photoUrl)
    } catch {
      // If not JSON, treat as direct URL
      photoUrl = responseText.trim()
      console.log("[v0] Response is not JSON, using as direct URL")
    }

    // Valida se a resposta contém uma URL válida
    if (!photoUrl || photoUrl.trim() === "" || !photoUrl.startsWith("https://")) {
      console.log("[v0] Invalid or empty response, returning fallback")
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

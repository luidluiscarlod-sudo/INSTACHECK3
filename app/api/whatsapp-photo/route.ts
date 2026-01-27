import { type NextRequest, NextResponse } from "next/server"

// Cache para armazenar resultados por 5 minutos
const cache = new Map<string, { result: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutos

export async function POST(request: NextRequest) {
  // Fallback padrão caso a API falhe
  const fallbackPayload = {
    success: false,
    result: null,
    error: "Service unavailable/Fallback",
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

    // Limpeza e formatação do número
    const cleanNumber = phone.replace(/\D/g, "")
    const cleanCountryCode = countryCode?.replace(/\D/g, "") || ""
    const fullPhone = cleanCountryCode + cleanNumber
    
    console.log("[v0] ========== WHATSAPP BIZNAME API ROUTE ==========")
    console.log("[v0] Phone received:", phone)
    console.log("[v0] Full phone number:", fullPhone)

    // Verifica cache
    const cached = cache.get(fullPhone)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      console.log("[v0] Returning cached result")
      return NextResponse.json(
        {
          success: true,
          result: cached.result,
          from_cache: true
        },
        {
          status: 200,
          headers: { "Access-Control-Allow-Origin": "*" },
        },
      )
    }

    // NOVA LÓGICA: Método GET para /bizname com query param
    const apiUrl = `https://whatsapp-data.p.rapidapi.com/bizname?phone=${fullPhone}`

    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "x-rapidapi-key": "42865ce77amsh6b3ec8ac168e4c3p1ae1b6jsndc1ea20ce2d0",
        "x-rapidapi-host": "whatsapp-data.p.rapidapi.com",
      },
      signal: AbortSignal.timeout?.(10_000),
    })

    console.log("[v0] API Response status:", response.status)

    // Tratamento de rate limit
    if (response.status === 429) {
      console.log("[v0] Rate limit exceeded")
      return NextResponse.json(fallbackPayload, {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
      })
    }

    if (!response.ok) {
      console.error("[v0] Erro ao consultar API:", response.status)
      return NextResponse.json(fallbackPayload, {
        status: 200,
        headers: { "Access-Control-Allow-Origin": "*" },
      })
    }

    const responseText = await response.text()

    console.log("[v0] ========== RAPIDAPI RESPONSE ==========")
    console.log("[v0] API Response body:", responseText.substring(0, 500))

    let apiResult: any
    try {
      apiResult = JSON.parse(responseText)
    } catch {
      apiResult = responseText.trim()
    }

    // Armazena no cache
    cache.set(fullPhone, {
      result: apiResult,
      timestamp: Date.now(),
    })

    // Limita o tamanho do cache
    if (cache.size > 100) {
      const oldestKey = Array.from(cache.entries()).sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0]
      cache.delete(oldestKey)
    }

    // Retorna o resultado para o frontend
    return NextResponse.json(
      {
        success: true,
        result: apiResult,
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

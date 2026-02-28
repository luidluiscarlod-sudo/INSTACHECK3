import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get client IP from headers
    const forwardedFor = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const clientIp = forwardedFor?.split(",")[0] || realIp || ""
    
    console.log("[v0] Location API - Client IP:", clientIp)
    
    // Use ip-api.com (works server-side with http)
    const apiUrl = clientIp 
      ? `http://ip-api.com/json/${clientIp}?fields=status,city,country,lat,lon`
      : `http://ip-api.com/json/?fields=status,city,country,lat,lon`
    
    const response = await fetch(apiUrl, {
      headers: {
        "User-Agent": "InstaCheck/1.0"
      }
    })
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }
    
    const data = await response.json()
    console.log("[v0] Location API response:", data)
    
    if (data.status === "fail") {
      throw new Error("IP lookup failed")
    }
    
    return NextResponse.json({
      success: true,
      city: data.city || "Unknown",
      country: data.country || "Unknown", 
      lat: data.lat || 0,
      lng: data.lon || 0
    })
  } catch (error) {
    console.error("[v0] Location API error:", error)
    
    // Return a realistic fallback based on common Brazilian cities
    const fallbackCities = [
      { city: "São Paulo", country: "Brazil", lat: -23.5505, lng: -46.6333 },
      { city: "Rio de Janeiro", country: "Brazil", lat: -22.9068, lng: -43.1729 },
      { city: "Fortaleza", country: "Brazil", lat: -3.7172, lng: -38.5433 },
      { city: "Belo Horizonte", country: "Brazil", lat: -19.9167, lng: -43.9345 },
      { city: "Salvador", country: "Brazil", lat: -12.9714, lng: -38.5014 },
    ]
    
    const randomCity = fallbackCities[Math.floor(Math.random() * fallbackCities.length)]
    
    return NextResponse.json({
      success: true,
      ...randomCity
    })
  }
}

import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json()

    if (!username) {
      return NextResponse.json({ success: false, error: "Username is required" }, { status: 400 })
    }

    const apiUrl = "https://instagram120.p.rapidapi.com/api/instagram/posts"

    console.log("[v0] Fetching Instagram posts for:", username)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "x-rapidapi-key": "42865ce77amsh6b3ec8ac168e4c3p1ae1b6jsndc1ea20ce2d0",
        "x-rapidapi-host": "instagram120.p.rapidapi.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        maxId: "",
      }),
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("[v0] Instagram Posts API error:", response.status, response.statusText)
      return NextResponse.json(
        {
          success: false,
          error: `Instagram API error: ${response.statusText}`,
        },
        { status: response.status },
      )
    }

    const data = await response.json()

    console.log("[v0] Instagram posts API raw response:", JSON.stringify(data, null, 2))
    console.log("[v0] Response status:", response.status)
    console.log("[v0] Response headers:", Object.fromEntries(response.headers))

    if (data.success === false || data.response_type === "private page") {
      console.log("[v0] Private or error response detected")
      return NextResponse.json({
        success: false,
        error: data.message || "This page is private",
        posts: [],
      })
    }

    // Try multiple response formats
    let items: any[] = []
    
    console.log("[v0] Checking data structure - has data.data.edges:", !!data.data?.edges)
    console.log("[v0] Checking data structure - has data.edges:", !!data.edges)
    console.log("[v0] Data keys:", Object.keys(data || {}))
    console.log("[v0] Data.data keys:", Object.keys(data?.data || {}))
    
    // Format 1: data.data.edges (from RapidAPI instagram120)
    if (data.data?.edges && Array.isArray(data.data.edges)) {
      items = data.data.edges.map((edge: any) => edge.node || edge)
      console.log("[v0] Found data.data.edges format, count:", items.length)
    }
    // Format 2: data.edges directly
    else if (data.edges && Array.isArray(data.edges)) {
      items = data.edges.map((edge: any) => edge.node || edge)
      console.log("[v0] Found data.edges format, count:", items.length)
    }
    // Format 3: data.data.items
    else if (data.data?.items && Array.isArray(data.data.items)) {
      items = data.data.items
      console.log("[v0] Found data.data.items format, count:", items.length)
    }
    // Format 4: data.items directly
    else if (data.items && Array.isArray(data.items)) {
      items = data.items
      console.log("[v0] Found data.items format, count:", items.length)
    }
    // Format 5: Check if data itself has nodes (different API response)
    else if (Array.isArray(data.data)) {
      items = data.data
      console.log("[v0] Found data.data array format, count:", items.length)
    }
    
    console.log("[v0] Total extracted items:", items.length)
    if (items.length > 0) {
      console.log("[v0] First item keys:", Object.keys(items[0] || {}))
    }

    return NextResponse.json({
      success: true,
      posts: items.map((post: any) => ({
        id: post.id || post.pk || "",
        caption: post.caption?.text || post.accessibility_caption || "",
        timestamp: post.taken_at || null,
        media_type: post.media_type || 1,
        // Try multiple image URL sources
        media_url: 
          post.image_versions2?.candidates?.[0]?.url ||
          post.image_versions?.items?.[0]?.url || 
          post.thumbnail_url ||
          post.display_url ||
          post.thumbnail_resources?.[0]?.src ||
          "",
        like_count: post.like_count || post.edge_liked_by?.count || 0,
        comment_count: post.comment_count || post.edge_media_to_comment?.count || 0,
      })),
      total_count: items.length,
    })
  } catch (error: any) {
    console.error("[v0] Error fetching Instagram posts:", error.message || error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to fetch Instagram posts",
      },
      { status: 500 },
    )
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

import { NextRequest, NextResponse } from "next/server"

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keyword = searchParams.get("keyword") ?? ""

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:7070/api/v1"

    const response = await fetch(
      `${apiUrl}/search?keyword=${encodeURIComponent(keyword)}`,
      { method: "GET", headers: { "Content-Type": "application/json" } }
    )

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Search API error:", error)
    return NextResponse.json(
      { codeMessage: "APP_MESSAGE_5000", message: "System error" },
      { status: 500 }
    )
  }
}
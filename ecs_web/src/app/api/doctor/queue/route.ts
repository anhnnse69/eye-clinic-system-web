import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api/v1"

function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = Buffer.from(base64, "base64").toString("utf-8")
    return JSON.parse(jsonPayload) as Record<string, unknown>
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get("auth_token")?.value

    if (!token) {
      return NextResponse.json(
        { success: false, codeMessage: "UNAUTHORIZED" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")

    const queryParams = new URLSearchParams()
    if (date) {
      queryParams.append("date", date)
    }

    const backendUrl = `${BACKEND_URL}/doctors/me/queue${queryParams.toString() ? `?${queryParams.toString()}` : ""}`
    
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      // @ts-expect-error - Node.js specific option for development
      signal: request.signal,
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[Queue Proxy] Error:", error)
    return NextResponse.json(
      {
        success: false,
        codeMessage: "APP_MESSAGE_5000",
        error: error?.message,
      },
      { status: 500 }
    )
  }
}

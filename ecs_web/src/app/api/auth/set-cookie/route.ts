import { NextRequest, NextResponse } from "next/server"

/**
 * Sets the httpOnly `auth_token` cookie used by server-side layouts
 * (e.g. /doctor/layout.tsx, /clinic-admin/layout.tsx, ...) to
 * authenticate and authorize the request.
 *
 * The JWT is also stored in localStorage on the client so that the
 * axios interceptor can attach it as a Bearer token for backend calls
 * (e.g. GET /api/v1/auth/me).
 *
 * Both storages are required:
 *   - Cookie  -> read by Next.js server layouts via `cookies()`
 *   - Header  -> attached by axios for backend (.NET) calls
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const token = body?.token

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { codeMessage: "APP_MESSAGE_4003", message: "Token is required" },
        { status: 400 }
      )
    }

    const response = NextResponse.json({ codeMessage: "APP_MESSAGE_2000" })

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("set-cookie error:", error)
    return NextResponse.json(
      { codeMessage: "APP_MESSAGE_5000", message: "System error" },
      { status: 500 }
    )
  }
}

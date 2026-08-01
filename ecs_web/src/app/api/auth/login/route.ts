import { NextRequest, NextResponse } from "next/server"
import { authService } from "@/services/auth.service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { emailAddress, password } = body

    console.log("Login attempt:", emailAddress)

    if (!emailAddress || !password) {
      return NextResponse.json(
        { codeMessage: "APP_MESSAGE_4003", message: "Missing credentials" },
        { status: 400 }
      )
    }

    const response = await authService.login({ emailAddress, password })

    console.log("Auth service response:", response)

    if (response.codeMessage === "APP_MESSAGE_2000" && response.data?.token) {
      const token = response.data.token

      const responseCookies = NextResponse.json(response)

      // Set token in httpOnly cookie
      responseCookies.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })

      return responseCookies
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Login API error:", error)
    return NextResponse.json(
      { codeMessage: "APP_MESSAGE_5000", message: "System error" },
      { status: 500 }
    )
  }
}

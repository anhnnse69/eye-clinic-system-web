import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { authService } from "@/services/auth.service"

if (process.env.NODE_ENV !== "production") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
}

export async function GET(_request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("auth_token")?.value

        if (!token) {
            return NextResponse.json({ authenticated: false }, { status: 401 })
        }

        const decoded = authService.decodeToken(token)
        if (!decoded) {
            return NextResponse.json({ authenticated: false }, { status: 401 })
        }

        const user = {
            id: decoded.sub || null,
            email:
                decoded.email ||
                (decoded as any)["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
                "",
            name:
                (decoded as any).FullName ||
                (decoded as any)["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
                "",
            role:
                (decoded as any).role ||
                (decoded as any)["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
                null,
        }

        return NextResponse.json({ authenticated: true, user }, { status: 200 })
    } catch (error: any) {
        console.error("Auth check API error:", error)
        return NextResponse.json({ authenticated: false }, { status: 500 })
    }
}

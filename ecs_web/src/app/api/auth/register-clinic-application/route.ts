import { NextRequest, NextResponse } from "next/server"

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      clinicName,
      clinicAddress,
      contactName,
      contactPhone,
      contactEmail,
      businessLicenseUrl,
    } = body

    if (!clinicName || !clinicAddress || !contactName || !contactPhone || !contactEmail) {
      return NextResponse.json(
        { codeMessage: "APP_MESSAGE_4003", message: "Missing required fields" },
        { status: 400 }
      )
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7070/api/v1"
    const response = await fetch(`${apiUrl}/auth/register-clinic-application`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        clinicName,
        clinicAddress,
        contactName,
        contactPhone,
        contactEmail,
        businessLicenseUrl: businessLicenseUrl || null,
      }),
    })

    const data = await response.json()
    return NextResponse.json(data, { status: response.status })
  } catch (error) {
    console.error("Clinic registration API error:", error)
    return NextResponse.json(
      { codeMessage: "APP_MESSAGE_5000", message: "System error" },
      { status: 500 }
    )
  }
}
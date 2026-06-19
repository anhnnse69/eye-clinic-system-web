import { NextRequest, NextResponse } from "next/server";

if (process.env.NODE_ENV !== "production") {
  process.env.NEXT_PUBLIC_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function GET(request: NextRequest) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ??
      "https://localhost:7070/api/v1";

    const searchParams = request.nextUrl.searchParams.toString();
    const url = `${apiUrl}/medical-record/patient-demographics${searchParams ? `?${searchParams}` : ""}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("View patient demographics API error:", error);

    return NextResponse.json(
      {
        codeMessage: "APP_MESSAGE_5000",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ??
      "https://localhost:7070/api/v1";

    const body = await request.json();

    // Get auth token from cookie
    const token = request.cookies.get("auth_token")?.value;

    const response = await fetch(`${apiUrl}/medical-record/demographics`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("Create patient demographics API error:", error);

    return NextResponse.json(
      {
        codeMessage: "APP_MESSAGE_5000",
      },
      {
        status: 500,
      }
    );
  }
}

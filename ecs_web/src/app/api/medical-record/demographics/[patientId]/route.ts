// app/api/medical-record/demographics/[patientId]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authService } from "@/services/auth.service";

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ patientId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token) {
      return NextResponse.json({ codeMessage: "UNAUTHORIZED" }, { status: 401 });
    }

    const decodedToken = authService.decodeToken(token);
    if (!decodedToken) {
      return NextResponse.json({ codeMessage: "UNAUTHORIZED" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { patientId } = resolvedParams;

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ??
      "https://localhost:7070/api/v1";

    const response = await fetch(
      `${apiUrl}/medical-record/demographics/${patientId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(15000),
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Backend returned error:", response.status, data);
    }

    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error("Get patient demographics detail API error:", error);
    return NextResponse.json(
      { codeMessage: "APP_MESSAGE_5000", detail: error.message },
      { status: 500 }
    );
  }
}

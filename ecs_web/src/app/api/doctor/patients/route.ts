// app/api/doctor/patients/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authService } from "@/services/auth.service";

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function GET(request: NextRequest) {
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

    // Lấy UserId từ token (sub là UserId)
    const userId = decodedToken.sub ||
                  (decodedToken as any).UserId ||
                  (decodedToken as any)["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

    if (!userId) {
      return NextResponse.json({ codeMessage: "UNAUTHORIZED" }, { status: 401 });
    }

    // Lấy query params
    const { searchParams } = new URL(request.url);
    const pageNumber = searchParams.get("pageNumber") ?? "1";
    const pageSize   = searchParams.get("pageSize")   ?? "10";
    const status     = searchParams.get("status");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:7070/api/v1";

    // Endpoint mới: /api/v1/doctors/{userId}/patients
    const query = new URLSearchParams({ pageNumber, pageSize });
    if (status) query.set("status", status);

    const response = await fetch(
      `${apiUrl}/doctors/${userId}/patients?${query.toString()}`,
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
    console.error("View patient list API error:", error);
    return NextResponse.json(
      { codeMessage: "APP_MESSAGE_5000", detail: error.message },
      { status: 500 }
    );
  }
}

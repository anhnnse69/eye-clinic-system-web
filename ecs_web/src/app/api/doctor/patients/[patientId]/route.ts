import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authService } from "@/services/auth.service";

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ patientId: string }> }
) {
  try {
    const { patientId } = await context.params;

    const cookieStore = await cookies();
    const token = cookieStore.get("auth_token")?.value;

    if (!token)
      return NextResponse.json({ codeMessage: "UNAUTHORIZED" }, { status: 401 });

    const decodedToken = authService.decodeToken(token);
    if (!decodedToken)
      return NextResponse.json({ codeMessage: "UNAUTHORIZED" }, { status: 401 });

    // Dùng userId — giống hệt route list
    const userId =
      decodedToken.sub ||
      (decodedToken as any).UserId ||
      (decodedToken as any)[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ];

    if (!userId)
      return NextResponse.json({ codeMessage: "FORBIDDEN" }, { status: 403 });

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:7070/api/v1";

    const response = await fetch(
      `${apiUrl}/doctors/${userId}/patients/${patientId}`,
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
    return NextResponse.json(data, { status: response.status });

  } catch (error: any) {
    console.error("Doctor patient detail API error:", error);
    return NextResponse.json(
      { codeMessage: "APP_MESSAGE_5000", message: error.message },
      { status: 500 }
    );
  }
}
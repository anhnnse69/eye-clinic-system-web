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

    console.log("🔑 UserId from token:", userId);

    if (!userId) {
      return NextResponse.json({ codeMessage: "UNAUTHORIZED" }, { status: 401 });
    }

    // === Mapping UserId → DoctorProfileId (Tạm thời) ===
    let doctorProfileId: string;

    if (userId === "22222222-2222-2222-2222-222222222222") {
      doctorProfileId = "E136648D-ED6F-43A1-9640-9107217D7A80"; // Doctor Emily
    } else {
      // TODO: Sau này sẽ gọi API lấy doctor profile hoặc thêm claim vào JWT
      doctorProfileId = userId; // fallback
    }

    console.log("✅ Final DoctorProfileId:", doctorProfileId);

    const { searchParams } = new URL(request.url);
    const pageNumber = searchParams.get("pageNumber") ?? "1";
    const pageSize   = searchParams.get("pageSize")   ?? "10";
    const status     = searchParams.get("status");

    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "https://localhost:7070/api/v1";

    const query = new URLSearchParams({ pageNumber, pageSize });
    if (status) query.set("status", status);

    const response = await fetch(
      `${apiUrl}/doctors/${doctorProfileId}/patients?${query.toString()}`,
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
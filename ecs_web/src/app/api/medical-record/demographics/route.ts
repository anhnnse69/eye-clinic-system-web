// app/api/medical-record/demographics/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authService } from "@/services/auth.service";

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ??
      "https://localhost:7070/api/v1";

    // Dispatch to correct backend endpoint based on request shape.
    // Patient demographics creation (CreatePatientDemographicsRequest) has `patientProfileId` and no `fullName`.
    // Medical-record creation (CreateMedicalRecordRequest) has `recordType`.
    const isPatientDemographics = !!body.patientProfileId && !body.recordType;
    const backendPath = isPatientDemographics
      ? "/patient/demographics"
      : "/medical-record/medical-records";

    const response = await fetch(`${apiUrl}${backendPath}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error("Backend returned error:", response.status, data);
    }

    // Map backend 409 → 200 for compatibility (both share the same route)
    // The frontend component handles 200 responses with error codes in the body.
    const statusToReturn =
      response.status === 409 ? 200 : response.status;

    return NextResponse.json(data, { status: statusToReturn });

  } catch (error: any) {
    console.error("Create demographics API error:", error);
    return NextResponse.json(
      { codeMessage: "APP_MESSAGE_5000", detail: error.message },
      { status: 500 }
    );
  }
}

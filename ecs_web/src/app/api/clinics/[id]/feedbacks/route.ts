import { NextRequest, NextResponse } from "next/server";

if (process.env.NODE_ENV !== "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);

    const pageNumber = searchParams.get("pageNumber") ?? "1";
    const pageSize = searchParams.get("pageSize") ?? "10";

    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ??
      "https://localhost:7070/api/v1";

    const response = await fetch(
      `${apiUrl}/clinics/${id}/feedbacks?pageNumber=${pageNumber}&pageSize=${pageSize}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("View clinic feedbacks API error:", error);

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
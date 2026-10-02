import { type NextRequest, NextResponse } from "next/server";
import { calculateAnalytics } from "@/app/lib/report-data";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const zone = searchParams.get("zone") || undefined;
  const branch = searchParams.get("branch") || undefined;
  const product = searchParams.get("product") || undefined;

  try {
    const analytics = calculateAnalytics({
      startDate,
      endDate,
      zone,
      branch,
      product,
    });

    return NextResponse.json(analytics);
  } catch (error) {
    console.error("Error calculating analytics:", error);
    return NextResponse.json(
      { error: "Error calculating analytics" },
      { status: 500 }
    );
  }
}

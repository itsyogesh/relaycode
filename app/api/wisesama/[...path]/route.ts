import { NextRequest, NextResponse } from "next/server";

const WISESAMA_API = process.env.WISESAMA_API_URL ?? "https://api.wisesama.com/api/v1";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const apiPath = path.join("/");
  const searchParams = request.nextUrl.searchParams;

  const url = `${WISESAMA_API}/${apiPath}?${searchParams.toString()}`;
  const headers: Record<string, string> = {};

  const apiKey = process.env.WISESAMA_API_KEY;
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  try {
    const res = await fetch(url, { headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch from Wisesama" },
      { status: 502 }
    );
  }
}

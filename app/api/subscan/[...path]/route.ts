import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  // First segment is the network, rest is the API path
  const [network, ...apiPath] = path;
  const url = `https://${network}.api.subscan.io/api/${apiPath.join("/")}`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const apiKey = process.env.SUBSCAN_API_KEY;
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }

  try {
    const body = await request.json();
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch from Subscan" },
      { status: 502 }
    );
  }
}

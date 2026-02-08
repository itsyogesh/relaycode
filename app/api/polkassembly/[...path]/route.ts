import { NextRequest, NextResponse } from "next/server";

const POLKASSEMBLY_API = "https://api.polkassembly.io/api/v1";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const apiPath = path.join("/");
  const searchParams = request.nextUrl.searchParams;
  const network = searchParams.get("network") ?? "polkadot";

  // Remove network from forwarded params
  searchParams.delete("network");

  const url = `${POLKASSEMBLY_API}/${apiPath}?${searchParams.toString()}`;
  const headers: Record<string, string> = {
    "x-network": network,
  };

  const apiKey = process.env.POLKASSEMBLY_API_KEY;
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  try {
    const res = await fetch(url, { headers });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch from Polkassembly" },
      { status: 502 }
    );
  }
}

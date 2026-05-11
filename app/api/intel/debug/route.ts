import { NextResponse } from "next/server";

// TEMPORARY — delete this file after confirming the key is set correctly
export async function GET() {
  const key = process.env.INTEL_API_KEY;
  return NextResponse.json({
    keySet: !!key,
    keyLength: key?.length ?? 0,
    keyPreview: key ? `${key.slice(0, 4)}...${key.slice(-4)}` : null,
  });
}

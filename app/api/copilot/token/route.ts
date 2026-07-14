import { NextResponse } from "next/server";
import { copilotTokenResponseSchema } from "@/lib/agent/tokenSchemas";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST() {
  const tokenEndpoint = process.env.COPILOT_TOKEN_ENDPOINT;
  if (!tokenEndpoint) {
    return NextResponse.json(
      {
        error: "Missing configuration",
        message: "COPILOT_TOKEN_ENDPOINT is not configured on the server.",
      },
      { status: 500 },
    );
  }

  let upstreamResponse: Response;
  try {
    upstreamResponse = await fetch(tokenEndpoint, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });
  } catch {
    return NextResponse.json(
      {
        error: "Upstream unreachable",
        message: "Could not reach Copilot token endpoint.",
      },
      { status: 502 },
    );
  }

  if (!upstreamResponse.ok) {
    return NextResponse.json(
      {
        error: "Upstream error",
        message: `Token endpoint returned ${upstreamResponse.status}.`,
      },
      { status: 502 },
    );
  }

  let rawData: unknown;
  try {
    rawData = await upstreamResponse.json();
  } catch {
    return NextResponse.json(
      {
        error: "Invalid response",
        message: "Token endpoint did not return valid JSON.",
      },
      { status: 502 },
    );
  }

  const parsed = copilotTokenResponseSchema.safeParse(rawData);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid response",
        message: "Token endpoint response is missing required fields.",
      },
      { status: 502 },
    );
  }

  return NextResponse.json(parsed.data, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

export async function GET() {
  return NextResponse.json(
    {
      error: "Method not allowed",
      message: "Use POST /api/copilot/token.",
    },
    { status: 405 },
  );
}

import { NextResponse } from "next/server";
import { copilotTokenResponseSchema } from "@/lib/agent/tokenSchemas";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const computeRegionalChannelSettingsUrl = (tokenEndpoint: string): string | null => {
  try {
    const endpointUrl = new URL(tokenEndpoint);
    const marker = "/powervirtualagents";
    const markerIndex = endpointUrl.pathname.indexOf(marker);
    if (markerIndex < 0) {
      return null;
    }

    const apiVersion = endpointUrl.searchParams.get("api-version");
    if (!apiVersion) {
      return null;
    }

    const environmentPath = endpointUrl.pathname.slice(0, markerIndex);
    const regionalUrl = new URL(
      `${environmentPath}/powervirtualagents/regionalchannelsettings`,
      endpointUrl.origin,
    );
    regionalUrl.searchParams.set("api-version", apiVersion);
    return regionalUrl.toString();
  } catch {
    return null;
  }
};

const extractDirectLineDomain = (rawValue: unknown): string | null => {
  if (!rawValue || typeof rawValue !== "object") {
    return null;
  }

  const byId = (rawValue as { channelUrlsById?: unknown }).channelUrlsById;
  if (!byId || typeof byId !== "object") {
    return null;
  }

  const directlineValue = (byId as { directline?: unknown }).directline;
  if (typeof directlineValue !== "string" || !directlineValue.trim()) {
    return null;
  }

  const normalizedBase = directlineValue.trim().replace(/\/+$/, "");
  return `${normalizedBase}/v3/directline`;
};

async function resolveDirectLineDomain(tokenEndpoint: string): Promise<string | null> {
  const regionalSettingsUrl = computeRegionalChannelSettingsUrl(tokenEndpoint);
  if (!regionalSettingsUrl) {
    return null;
  }

  try {
    const response = await fetch(regionalSettingsUrl, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    const json = (await response.json()) as unknown;
    return extractDirectLineDomain(json);
  } catch {
    return null;
  }
}

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

  const directLineDomain = await resolveDirectLineDomain(tokenEndpoint);
  const responsePayload = {
    ...parsed.data,
    ...(directLineDomain ? { directLineDomain } : {}),
  };

  return NextResponse.json(responsePayload, {
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

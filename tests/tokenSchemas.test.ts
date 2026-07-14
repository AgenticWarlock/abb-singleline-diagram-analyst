import { describe, expect, it } from "vitest";
import { copilotTokenResponseSchema } from "@/lib/agent/tokenSchemas";

describe("copilotTokenResponseSchema", () => {
  it("accepts a valid token endpoint response", () => {
    const payload = {
      token: "abc123",
      expires_in: 1800,
      conversationId: "conv-01",
    };

    expect(() => copilotTokenResponseSchema.parse(payload)).not.toThrow();
  });

  it("rejects invalid token endpoint response", () => {
    const payload = {
      token: "",
      expires_in: "1800",
    };

    expect(() => copilotTokenResponseSchema.parse(payload)).toThrow();
  });
});
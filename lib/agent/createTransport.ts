import type { AgentTransport } from "@/lib/agent/AgentTransport";
import { DirectLineTransport } from "@/lib/agent/DirectLineTransport";
import { MockAgentTransport } from "@/lib/agent/MockAgentTransport";

export const getConfiguredTransportMode = (): "mock" | "directline" => {
  const mode = process.env.NEXT_PUBLIC_AGENT_TRANSPORT?.toLowerCase();
  return mode === "mock" ? "mock" : "directline";
};

export const createAgentTransport = (): AgentTransport => {
  return getConfiguredTransportMode() === "mock"
    ? new MockAgentTransport()
    : new DirectLineTransport();
};
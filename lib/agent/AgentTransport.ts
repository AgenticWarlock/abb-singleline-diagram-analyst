import type { AgentToUiEvent, UiToAgentEvent } from "./eventTypes";

export type AgentEventListener = (event: AgentToUiEvent) => void;
export type AgentConnectionStatus =
  | "disconnected"
  | "connecting"
  | "online"
  | "reconnecting"
  | "expired"
  | "failed";
export type AgentConnectionStatusListener = (status: AgentConnectionStatus) => void;

export interface AgentTransport {
  connect(): Promise<void>;
  sendMessage(text: string): Promise<void>;
  sendEvent(event: UiToAgentEvent): Promise<void>;
  subscribe(listener: AgentEventListener): () => void;
  subscribeConnectionStatus(listener: AgentConnectionStatusListener): () => void;
  disconnect(): Promise<void>;
}

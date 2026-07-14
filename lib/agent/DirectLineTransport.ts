import { ConnectionStatus, DirectLine, type Activity } from "botframework-directlinejs";
import { agentToUiEventSchema } from "@/lib/agent/eventSchemas";
import {
  mapDirectLineActivityToAgentEvent,
  isOwnUserMessage,
} from "@/lib/agent/directLineAdapters";
import { copilotTokenResponseSchema } from "@/lib/agent/tokenSchemas";
import type {
  AgentConnectionStatus,
  AgentConnectionStatusListener,
  AgentTransport,
  AgentEventListener,
} from "./AgentTransport";
import type { UiToAgentEvent } from "./eventTypes";

export class DirectLineTransport implements AgentTransport {
  private directLine: DirectLine | null = null;
  private listeners = new Set<AgentEventListener>();
  private statusListeners = new Set<AgentConnectionStatusListener>();
  private activitySubscription: { unsubscribe: () => void } | null = null;
  private statusSubscription: { unsubscribe: () => void } | null = null;
  private userId = `web-${crypto.randomUUID()}`;
  private connectionStatus: AgentConnectionStatus = "disconnected";
  private lastConversationId: string | null = null;
  private connectedReady = false;
  private reconnecting = false;

  async connect(): Promise<void> {
    await this.initializeDirectLine();
  }

  private async initializeDirectLine(): Promise<void> {
    this.emitConnectionStatus("connecting");
    this.connectedReady = false;

    const response = await fetch("/api/copilot/token", {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      this.emitConnectionStatus("failed");
      throw new Error(`Token endpoint request failed with ${response.status}.`);
    }

    const json = await response.json();
    const tokenPayload = copilotTokenResponseSchema.parse(json);
    this.lastConversationId = tokenPayload.conversationId;

    this.activitySubscription?.unsubscribe();
    this.statusSubscription?.unsubscribe();
    this.activitySubscription = null;
    this.statusSubscription = null;

    if (this.directLine) {
      this.directLine.end();
      this.directLine = null;
    }

    this.directLine = new DirectLine({
      token: tokenPayload.token,
      conversationId: tokenPayload.conversationId,
      // Token endpoint only returns token/conversationId. Without a streamUrl,
      // websocket reconnect can fail with 403 in some Copilot Studio setups.
      webSocket: false,
    });

    this.statusSubscription = this.directLine.connectionStatus$.subscribe({
      next: (status) => {
        this.handleDirectLineConnectionStatus(status);
      },
      error: () => {
        this.emitConnectionStatus("failed");
      },
    });

    this.activitySubscription = this.directLine.activity$.subscribe({
      next: (activity) => {
        this.handleActivity(activity);
      },
      error: () => {
        this.emitConnectionStatus("failed");
      },
    });

    await new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Direct Line connection timeout."));
      }, 12000);

      const waitSubscription = this.directLine?.connectionStatus$.subscribe({
        next: (status) => {
          if (status === ConnectionStatus.Online) {
            clearTimeout(timeoutId);
            this.connectedReady = true;
            waitSubscription?.unsubscribe();
            resolve();
          }

          if (
            status === ConnectionStatus.FailedToConnect ||
            status === ConnectionStatus.Ended ||
            status === ConnectionStatus.ExpiredToken
          ) {
            clearTimeout(timeoutId);
            this.connectedReady = false;
            waitSubscription?.unsubscribe();
            reject(new Error(`Direct Line failed with status ${status}.`));
          }
        },
        error: () => {
          clearTimeout(timeoutId);
          this.connectedReady = false;
          waitSubscription?.unsubscribe();
          reject(new Error("Direct Line status stream failed."));
        },
      });
    });
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.directLine || !this.connectedReady || this.connectionStatus !== "online") {
      await this.reconnectWithFreshToken();
    }

    if (!this.directLine || !this.connectedReady || this.connectionStatus !== "online") {
      throw new Error("DirectLineTransport is not online.");
    }

    const activity: Activity = {
      type: "message",
      from: { id: this.userId, name: "Usuario" },
      text,
      locale: "es-ES",
    };

    const directLine = this.directLine;
    try {
      await new Promise<void>((resolve, reject) => {
        const subscription = directLine.postActivity(activity).subscribe({
          next: () => {
            subscription.unsubscribe();
            resolve();
          },
          error: (error: unknown) => {
            subscription.unsubscribe();
            reject(error);
          },
        });
      });
    } catch {
      await this.reconnectWithFreshToken();

      if (!this.directLine || !this.connectedReady || this.connectionStatus !== "online") {
        throw new Error("DirectLineTransport failed to reconnect.");
      }

      await new Promise<void>((resolve, reject) => {
        const retrySubscription = this.directLine?.postActivity(activity).subscribe({
          next: () => {
            retrySubscription?.unsubscribe();
            resolve();
          },
          error: (error: unknown) => {
            retrySubscription?.unsubscribe();
            reject(error);
          },
        });
      });
    }
  }

  private async reconnectWithFreshToken(): Promise<void> {
    if (this.reconnecting) {
      return;
    }

    this.reconnecting = true;
    this.emitConnectionStatus("reconnecting");

    try {
      await this.initializeDirectLine();
    } catch {
      this.emitConnectionStatus("failed");
      throw new Error("Unable to refresh Direct Line connection.");
    } finally {
      this.reconnecting = false;
    }
  }

  async sendEvent(event: UiToAgentEvent): Promise<void> {
    void event;
    return;
  }

  subscribe(listener: AgentEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  subscribeConnectionStatus(listener: AgentConnectionStatusListener): () => void {
    this.statusListeners.add(listener);
    listener(this.connectionStatus);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  async disconnect(): Promise<void> {
    this.activitySubscription?.unsubscribe();
    this.statusSubscription?.unsubscribe();
    this.activitySubscription = null;
    this.statusSubscription = null;

    if (this.directLine) {
      this.directLine.end();
      this.directLine = null;
    }

    this.emitConnectionStatus("disconnected");
    this.lastConversationId = null;
    this.connectedReady = false;
    this.listeners.clear();
    this.statusListeners.clear();
    return;
  }

  private emitConnectionStatus(status: AgentConnectionStatus): void {
    this.connectionStatus = status;
    if (status !== "online") {
      this.connectedReady = false;
    }
    this.statusListeners.forEach((listener) => listener(status));
  }

  private handleDirectLineConnectionStatus(status: ConnectionStatus): void {
    if (status === ConnectionStatus.Connecting) {
      this.emitConnectionStatus(
        this.connectionStatus === "online" ? "reconnecting" : "connecting",
      );
      return;
    }

    if (status === ConnectionStatus.Online) {
      this.emitConnectionStatus("online");
      return;
    }

    if (status === ConnectionStatus.ExpiredToken) {
      this.emitConnectionStatus("expired");
      return;
    }

    if (status === ConnectionStatus.FailedToConnect) {
      this.emitConnectionStatus("failed");
      return;
    }

    if (status === ConnectionStatus.Uninitialized || status === ConnectionStatus.Ended) {
      this.emitConnectionStatus("disconnected");
    }
  }

  private handleActivity(activity: Activity): void {
    if (isOwnUserMessage(activity, this.userId)) {
      return;
    }

    const mappedEvent = mapDirectLineActivityToAgentEvent(activity);
    if (!mappedEvent) {
      return;
    }

    const safeEvent = agentToUiEventSchema.parse(mappedEvent);
    this.listeners.forEach((listener) => listener(safeEvent));
  }
}

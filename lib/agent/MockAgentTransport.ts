import type {
  AgentConnectionStatus,
  AgentConnectionStatusListener,
  AgentTransport,
  AgentEventListener,
} from "./AgentTransport";
import {
  agentToUiEventSchema,
  uiToAgentEventSchema,
} from "@/lib/agent/eventSchemas";
import type {
  AgentToUiEvent,
  UiToAgentEvent,
} from "@/lib/agent/eventTypes";

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export class MockAgentTransport implements AgentTransport {
  private listeners = new Set<AgentEventListener>();
  private statusListeners = new Set<AgentConnectionStatusListener>();
  private connected = false;
  private connectionStatus: AgentConnectionStatus = "disconnected";

  async connect(): Promise<void> {
    this.emitConnectionStatus("connecting");
    this.connected = true;
    this.emitConnectionStatus("online");
    this.emit({
      type: "ui.showMessage",
      payload: {
        text: "Hola. Soy tu asistente ABB. Puedes escribir una consulta y adjuntar imagenes o PDF para analizarlos.",
        authorName: "Asistente ABB",
      },
    });
  }

  async sendMessage(text: string): Promise<void> {
    if (!this.connected) {
      throw new Error("Transport is not connected.");
    }

    const normalized = text.toLowerCase();
    const attachmentLines = text
      .split("Adjuntos del usuario:")[1]
      ?.split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("- ")) ?? [];

    if (attachmentLines.length > 0) {
      const imageCount = attachmentLines.filter((line) => line.includes("imagen")).length;
      const pdfCount = attachmentLines.filter((line) => line.toLowerCase().includes("pdf")).length;

      await delay(350);
      this.emit({
        type: "ui.showMessage",
        payload: {
          text: [
            `He recibido ${attachmentLines.length} adjunto${attachmentLines.length === 1 ? "" : "s"}.`,
            "",
            "**Analisis preliminar**",
            imageCount > 0 ? `- Imagenes detectadas: ${imageCount}` : null,
            pdfCount > 0 ? `- PDFs detectados: ${pdfCount}` : null,
            "- El flujo de chat ya no depende de formularios de reserva.",
            "- Puedo usar este contexto para responder preguntas tecnicas o resumir hallazgos.",
            "",
            "**Siguiente paso sugerido**",
            "- Indica que quieres revisar: incidencias, resumen, elementos dudosos o acciones recomendadas.",
          ]
            .filter(Boolean)
            .join("\n"),
          authorName: "Asistente ABB",
        },
      });
      return;
    }

    await delay(250);
    this.emit({
      type: "ui.showMessage",
      payload: {
        text: normalized.includes("diagrama") || normalized.includes("imagen") || normalized.includes("pdf")
          ? "Puedo ayudarte a revisar ese material. Si quieres un analisis mas concreto, adjunta el archivo y dime exactamente que debo buscar."
          : "Puedo ayudarte a analizar diagramas, capturas o documentos PDF. Adjunta un archivo y formula una pregunta concreta.",
        authorName: "Asistente ABB",
      },
    });
  }

  async sendEvent(event: UiToAgentEvent): Promise<void> {
    if (!this.connected) {
      throw new Error("Transport is not connected.");
    }

    uiToAgentEventSchema.parse(event);

    await delay(150);
    this.emit({
      type: "ui.showMessage",
      payload: {
        text: "La interfaz de reservas se ha retirado de este mock. Usa mensajes de chat y adjuntos para continuar el analisis.",
        authorName: "Asistente ABB",
      },
    });
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
    this.connected = false;
    this.listeners.clear();
    this.emitConnectionStatus("disconnected");
    this.statusListeners.clear();
  }

  private emit(event: AgentToUiEvent): void {
    const safeEvent = agentToUiEventSchema.parse(event);
    this.listeners.forEach((listener) => listener(safeEvent));
  }

  private emitConnectionStatus(status: AgentConnectionStatus): void {
    this.connectionStatus = status;
    this.statusListeners.forEach((listener) => listener(status));
  }
}

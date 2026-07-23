"use client";

import { useEffect, useRef, useState } from "react";
import { Badge, BrandVariants, createLightTheme, FluentProvider, Text } from "@fluentui/react-components";
import { ChatPanel } from "@/components/chat";
import {
  createAgentTransport,
  type AgentConnectionStatus,
  type AgentTransport,
  type ChatMessageModel,
} from "@/lib/agent";
import styles from "./page.module.css";

const BYTES_IN_MB = 1024 * 1024;

const abbBrand: BrandVariants = {
  10: "#2A0000", 20: "#450000", 30: "#600000", 40: "#7A0000", 50: "#940000",
  60: "#AE0000", 70: "#C70000", 80: "#D60000", 90: "#E60000", 100: "#FF0000",
  110: "#FF3333", 120: "#FF5C5C", 130: "#FF8585", 140: "#FFA3A3",
  150: "#FFC2C2", 160: "#FFE0E0",
};
const abbTheme = createLightTheme(abbBrand);

const statusLabels: Record<AgentConnectionStatus, string> = {
  online: "Conectado",
  connecting: "Conectando...",
  reconnecting: "Reconectando...",
  disconnected: "Desconectado",
  expired: "Sesion expirada",
  failed: "Error",
};

const defaultAgentDisplayName = process.env.NEXT_PUBLIC_AGENT_DISPLAY_NAME?.trim() || "Agente";
const defaultAgentSubtitle =
  process.env.NEXT_PUBLIC_AGENT_SUBTITLE?.trim() || "Copilot Studio · mensajes, imagenes y PDF";
const defaultAgentDescription =
  process.env.NEXT_PUBLIC_AGENT_DESCRIPTION?.trim() ||
  "Asistente conversacional para analizar diagramas, imagenes y documentos PDF.";
const defaultChatEmptyTitle =
  process.env.NEXT_PUBLIC_AGENT_EMPTY_TITLE?.trim() || "AISA\nAI-powered SLD Analyzer";

const formatFileSize = (sizeInBytes: number): string => {
  if (sizeInBytes < 1024) {
    return `${sizeInBytes} B`;
  }

  if (sizeInBytes < BYTES_IN_MB) {
    return `${(sizeInBytes / 1024).toFixed(1)} KB`;
  }

  return `${(sizeInBytes / BYTES_IN_MB).toFixed(2)} MB`;
};

const createMessage = (
  role: ChatMessageModel["role"],
  text: string,
  authorName?: string,
): ChatMessageModel => ({
  id: crypto.randomUUID(),
  role,
  text,
  timestamp: new Date().toISOString(),
  authorName,
});

const formatAttachmentKind = (file: File): string => {
  if (file.type.startsWith("image/")) {
    return "imagen";
  }

  if (file.type === "application/pdf") {
    return "PDF";
  }

  return "archivo";
};

const buildAttachmentSummary = (attachments: File[]): string =>
  attachments
    .map((file) => `- ${file.name} (${formatAttachmentKind(file)}, ${formatFileSize(file.size)})`)
    .join("\n");

export default function Home() {
  const transportRef = useRef<AgentTransport | null>(null);
  const busyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<AgentConnectionStatus>("disconnected");
  const [panelError, setPanelError] = useState<string | null>(null);
  const [agentDisplayName, setAgentDisplayName] = useState(defaultAgentDisplayName);

  const appendMessage = (message: ChatMessageModel) => {
    setMessages((prev) => [...prev, message]);
  };

  const releaseBusy = () => {
    if (busyTimeoutRef.current) {
      clearTimeout(busyTimeoutRef.current);
      busyTimeoutRef.current = null;
    }
    setIsBusy(false);
  };

  useEffect(() => {
    const transport = createAgentTransport();
    transportRef.current = transport;

    const unsubscribe = transport.subscribe((event) => {
      releaseBusy();

      if (event.type === "ui.showMessage") {
        const nextAgentName = event.payload.authorName?.trim();
        if (nextAgentName) {
          setAgentDisplayName(nextAgentName);
        }

        appendMessage(createMessage("agent", event.payload.text, nextAgentName));
      }
    });

    const unsubscribeStatus = transport.subscribeConnectionStatus((status) => {
      setConnectionStatus(status);
      if (status === "disconnected" || status === "failed") {
        releaseBusy();
      }
    });

    transport.connect().catch(() => {
      appendMessage(createMessage("system", "No se pudo conectar con el agente."));
    });

    return () => {
      unsubscribe();
      unsubscribeStatus();
      transport.disconnect().catch(() => undefined);
    };
  }, []);

  const onSendMessage = async (text: string, attachments: File[]) => {
    if (connectionStatus !== "online") {
      return;
    }

    const trimmed = text.trim();
    if (!trimmed && attachments.length === 0) {
      return;
    }

    const prompt = trimmed || "Analiza los adjuntos compartidos.";
    const attachmentSummary = attachments.length > 0 ? buildAttachmentSummary(attachments) : "";
    const userMessage = attachmentSummary
      ? `${prompt}\n\n**Adjuntos**\n${attachmentSummary}`
      : prompt;
    const transportMessage = attachmentSummary
      ? `${prompt}\n\nAdjuntos del usuario:\n${attachmentSummary}\n\nResponde en espanol con un analisis breve y siguientes pasos.`
      : prompt;

    appendMessage(createMessage("user", userMessage));
    setPanelError(null);
    setIsBusy(true);

    busyTimeoutRef.current = setTimeout(() => {
      setIsBusy(false);
      busyTimeoutRef.current = null;
    }, 20_000);

    try {
      await transportRef.current?.sendMessage(transportMessage);
    } catch {
      setPanelError("No fue posible procesar tu mensaje.");
      releaseBusy();
    }
  };

  return (
    <FluentProvider theme={abbTheme}>
      <div className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerBrand}>
            <span className={styles.headerLogo}>ABB</span>
            <div className={styles.headerCopy}>
              <Text className={styles.headerTitle}>{agentDisplayName}</Text>
              <Text className={styles.headerSub}>{defaultAgentSubtitle}</Text>
            </div>
          </div>
          <Badge
            appearance="filled"
            color="informative"
            size="small"
            className={`${styles.statusBadge} ${
              connectionStatus === "online" ? styles.statusBadgeOnline : ""
            }`}
          >
            {statusLabels[connectionStatus]}
          </Badge>
        </header>
        <main className={styles.main}>
          <section className={styles.chatPanel}>
            <ChatPanel
              messages={messages}
              isBusy={isBusy}
              onSendMessage={onSendMessage}
              inputDisabled={connectionStatus !== "online"}
              emptyTitle={defaultChatEmptyTitle}
              emptyDescription={defaultAgentDescription}
            />
          </section>
          {panelError ? <p className={styles.panelError}>{panelError}</p> : null}
        </main>
      </div>
    </FluentProvider>
  );
}

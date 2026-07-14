"use client";

import { Body1Strong, Card, Divider, Spinner } from "@fluentui/react-components";
import type { AgentConnectionStatus } from "@/lib/agent/AgentTransport";
import type { ChatMessageModel } from "@/lib/agent/eventTypes";
import { ChatMessage } from "./ChatMessage";
import { ChatComposer } from "./ChatComposer";
import styles from "./ChatPanel.module.css";

interface ChatPanelProps {
  messages: ChatMessageModel[];
  isBusy: boolean;
  connectionStatus: AgentConnectionStatus;
  onSendMessage: (text: string) => Promise<void>;
}

export function ChatPanel({ messages, isBusy, connectionStatus, onSendMessage }: ChatPanelProps) {
  return (
    <Card className={styles.wrapper}>
      <header className={styles.header}>
        <Body1Strong>Asistente de Viajes</Body1Strong>
        <span className={styles.status}>{connectionStatus}</span>
      </header>
      <Divider />
      <section className={styles.messages} aria-label="Historial de conversación">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </section>
      {isBusy && (
        <div className={styles.loading}>
          <Spinner size="tiny" label="Esperando respuesta del agente" labelPosition="after" />
        </div>
      )}
      <Divider />
      <ChatComposer onSend={onSendMessage} disabled={isBusy} />
    </Card>
  );
}

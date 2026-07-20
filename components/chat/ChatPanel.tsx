"use client";

import { useEffect, useRef } from "react";
import React from "react";
import { Body1Strong, Card } from "@fluentui/react-components";
import type { ChatMessageModel } from "@/lib/agent/eventTypes";
import { ChatMessage } from "./ChatMessage";
import { ChatComposer } from "./ChatComposer";
import styles from "./ChatPanel.module.css";

interface ChatPanelProps {
  messages: ChatMessageModel[];
  isBusy: boolean;
  inputDisabled: boolean;
  onSendMessage: (text: string) => Promise<void>;
  /** Contenido rico opcional que se renderiza inline al final de los mensajes */
  inlineContent?: React.ReactNode;
}

export function ChatPanel({ messages, isBusy, inputDisabled, onSendMessage, inlineContent }: ChatPanelProps) {
  const messagesContainerRef = useRef<HTMLElement>(null);
  const inlineContentRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInlineContent = inlineContent !== undefined && inlineContent !== null;

  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const raf = requestAnimationFrame(() => {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "auto",
      });
    });

    return () => cancelAnimationFrame(raf);
  };

  useEffect(() => {
    return scrollToBottom();
  }, [messages, isBusy]);

  useEffect(() => {
    if (!hasInlineContent) return;

    const container = messagesContainerRef.current;
    const inline = inlineContentRef.current;
    if (!container || !inline) {
      return scrollToBottom();
    }

    const raf = requestAnimationFrame(() => {
      const desiredBottomGap = 10;
      const targetTop = inline.offsetTop + inline.clientHeight - container.clientHeight + desiredBottomGap;
      container.scrollTo({
        top: Math.max(0, targetTop),
        behavior: "auto",
      });
    });

    return () => cancelAnimationFrame(raf);
  }, [hasInlineContent, messages.length]);

  return (
    <Card className={styles.wrapper} style={{ padding: 0, gap: 0 }}>
      <section
        ref={messagesContainerRef}
        className={`${styles.messages} ${hasInlineContent ? styles.messagesWithInline : ""}`}
        aria-label="Historial de conversación"
      >
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>⚓</span>
            <Body1Strong className={styles.emptyText}>
              ¡Hola! Soy tu Nauta de reservas.
            </Body1Strong>
            <span className={styles.emptySub}>
              Cuéntame a dónde quieres viajar.
            </span>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
        {isBusy && (
          <div className={styles.typingIndicator} aria-label="El agente está escribiendo">
            <div className={styles.typingBubble}>
              <span className={styles.dot} />
              <span className={styles.dot} />
              <span className={styles.dot} />
            </div>
            <span className={styles.typingLabel}>Nauta de reservas está escribiendo…</span>
          </div>
        )}
        {inlineContent && (
          <div ref={inlineContentRef} className={styles.inlineContent}>
            {inlineContent}
          </div>
        )}
        <div ref={messagesEndRef} />
      </section>
      <ChatComposer onSend={onSendMessage} disabled={isBusy || inputDisabled} />
    </Card>
  );
}

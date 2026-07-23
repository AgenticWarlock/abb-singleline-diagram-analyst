"use client";

import { useEffect, useRef } from "react";
import { AdaptiveCard } from "adaptivecards";
import { Caption1 } from "@fluentui/react-components";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessageModel } from "@/lib/agent/eventTypes";
import styles from "./ChatMessage.module.css";

interface ChatMessageProps {
  message: ChatMessageModel;
}

interface AdaptiveCardViewProps {
  cardPayload: unknown;
}

const toCardPayload = (payload: unknown): Record<string, unknown> | null => {
  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return null;
  }

  return payload as Record<string, unknown>;
};

function AdaptiveCardView({ cardPayload }: AdaptiveCardViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const parsedPayload = toCardPayload(cardPayload);
    if (!container || !parsedPayload) {
      return;
    }

    const adaptiveCard = new AdaptiveCard();
    adaptiveCard.parse(parsedPayload);
    const renderedCard = adaptiveCard.render();
    container.replaceChildren(...(renderedCard ? [renderedCard] : []));
  }, [cardPayload]);

  return <div ref={containerRef} className={styles.adaptiveCard} />;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const roleLabel =
    message.role === "user"
      ? "Tú"
      : message.role === "agent"
        ? message.authorName?.trim() || "Agente"
        : "Sistema";

  return (
    <article className={`${styles.message} ${styles[message.role]}`} aria-live="polite">
      <Caption1 className={styles.role}>{roleLabel}</Caption1>
      <div className={styles.content}>
        {message.text ? <Markdown remarkPlugins={[remarkGfm]}>{message.text}</Markdown> : null}
        {message.adaptiveCards?.map((cardPayload, index) => (
          <AdaptiveCardView
            key={`${message.id}-adaptive-card-${index}`}
            cardPayload={cardPayload}
          />
        ))}
      </div>
    </article>
  );
}

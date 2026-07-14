import { Body1, Caption1 } from "@fluentui/react-components";
import type { ChatMessageModel } from "@/lib/agent/eventTypes";
import styles from "./ChatMessage.module.css";

interface ChatMessageProps {
  message: ChatMessageModel;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const roleLabel =
    message.role === "user"
      ? "Tú"
      : message.role === "agent"
        ? "Agente"
        : "Sistema";

  return (
    <article className={`${styles.message} ${styles[message.role]}`} aria-live="polite">
      <Caption1 className={styles.role}>{roleLabel}</Caption1>
      <Body1>{message.text}</Body1>
    </article>
  );
}

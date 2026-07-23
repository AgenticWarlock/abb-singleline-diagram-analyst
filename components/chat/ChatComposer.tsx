"use client";

import { useRef, useState } from "react";
import { Button, Textarea } from "@fluentui/react-components";
import {
  Attach24Regular,
  Dismiss24Regular,
  DocumentPdf24Regular,
  Image24Regular,
  Send24Regular,
} from "@fluentui/react-icons";
import styles from "./ChatComposer.module.css";

interface ChatComposerProps {
  onSend: (text: string, attachments: File[]) => Promise<void>;
  disabled?: boolean;
}

interface PendingAttachment {
  id: string;
  file: File;
}

const isSupportedFile = (file: File): boolean =>
  file.type.startsWith("image/") || file.type === "application/pdf";

export function ChatComposer({ onSend, disabled = false }: ChatComposerProps) {
  const [value, setValue] = useState("");
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelected = (selectedFiles: FileList | null) => {
    if (!selectedFiles) {
      return;
    }

    const nextFiles = Array.from(selectedFiles);
    const supportedFiles = nextFiles.filter(isSupportedFile);

    if (supportedFiles.length !== nextFiles.length) {
      setError("Solo se admiten imagenes y archivos PDF.");
    } else {
      setError(null);
    }

    setAttachments((prev) => [
      ...prev,
      ...supportedFiles.map((file) => ({
        id: crypto.randomUUID(),
        file,
      })),
    ]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((attachment) => attachment.id !== id));
  };

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed && attachments.length === 0) {
      return;
    }

    const files = attachments.map((attachment) => attachment.file);
    setValue("");
    setAttachments([]);
    setError(null);
    await onSend(trimmed, files);
  };

  return (
    <div className={styles.composer}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.pdf"
        multiple
        onChange={(event) => handleFilesSelected(event.target.files)}
        className={styles.fileInput}
      />
      <label htmlFor="chat-input" className={styles.label}>
        Escribe tu mensaje
      </label>
      {attachments.length > 0 ? (
        <div className={styles.attachmentList}>
          {attachments.map((attachment) => {
            const isImage = attachment.file.type.startsWith("image/");

            return (
              <div key={attachment.id} className={styles.attachmentChip}>
                <span className={styles.attachmentIcon} aria-hidden="true">
                  {isImage ? <Image24Regular /> : <DocumentPdf24Regular />}
                </span>
                <span className={styles.attachmentName}>{attachment.file.name}</span>
                <button
                  type="button"
                  className={styles.removeAttachmentButton}
                  onClick={() => removeAttachment(attachment.id)}
                  aria-label={`Quitar ${attachment.file.name}`}
                >
                  <Dismiss24Regular />
                </button>
              </div>
            );
          })}
        </div>
      ) : null}
      {error ? <p className={styles.error}>{error}</p> : null}
      <Textarea
        id="chat-input"
        placeholder="Ejemplo: Analiza esta imagen del diagrama y dime incidencias"
        value={value}
        onChange={(_, data) => setValue(data.value)}
        onKeyDown={async (event) => {
          if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            await handleSend();
          }
        }}
        disabled={disabled}
        resize="none"
        rows={2}
        aria-label="Escribe un mensaje para el agente"
        className={styles.input}
        style={{ gridColumn: "1 / 2", gridRow: "4" }}
      />
      <Button
        appearance="secondary"
        icon={<Attach24Regular />}
        onClick={() => fileInputRef.current?.click()}
        disabled={disabled}
        className={styles.attachButton}
        style={{ gridColumn: "1 / 2", gridRow: "3", justifySelf: "start" }}
      >
        Adjuntar
      </Button>
      <Button
        appearance="primary"
        icon={<Send24Regular />}
        onClick={handleSend}
        disabled={disabled || (!value.trim() && attachments.length === 0)}
        className={styles.sendButton}
        style={{ gridColumn: "2 / 3", gridRow: "4", alignSelf: "end" }}
      >
        Enviar
      </Button>
    </div>
  );
}

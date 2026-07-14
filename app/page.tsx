"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { DateRange } from "react-day-picker";
import { Body1Strong, FluentProvider, webLightTheme } from "@fluentui/react-components";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { RichInteractionPanel } from "@/components/travel/RichInteractionPanel";
import type { AgentConnectionStatus, AgentTransport } from "@/lib/agent/AgentTransport";
import { createAgentTransport, getConfiguredTransportMode } from "@/lib/agent/createTransport";
import type { ChatMessageModel, FlightOption } from "@/lib/agent/eventTypes";
import styles from "./page.module.css";

const createMessage = (
  role: ChatMessageModel["role"],
  text: string,
): ChatMessageModel => ({
  id: crypto.randomUUID(),
  role,
  text,
  timestamp: new Date().toISOString(),
});

export default function Home() {
  const transportRef = useRef<AgentTransport | null>(null);
  const transportMode = getConfiguredTransportMode();
  const [messages, setMessages] = useState<ChatMessageModel[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<AgentConnectionStatus>("disconnected");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [panelLoading, setPanelLoading] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);
  const [destination, setDestination] = useState("Roma");
  const [dateHint, setDateHint] = useState("Selecciona fecha de ida y vuelta");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedFlightId, setSelectedFlightId] = useState<string | undefined>();
  const [flights, setFlights] = useState<FlightOption[]>([]);

  const appendMessage = (message: ChatMessageModel) => {
    setMessages((prev) => [...prev, message]);
  };

  useEffect(() => {
    const transport = createAgentTransport();
    transportRef.current = transport;

    const unsubscribe = transport.subscribe((event) => {
      if (event.type === "ui.showMessage") {
        appendMessage(createMessage("agent", event.payload.text));
      }

      if (event.type === "ui.showDatePicker") {
        setDestination(event.payload.destination);
        setDateHint(event.payload.hint);
        setShowDatePicker(true);
        setPanelLoading(false);
        setPanelError(null);
      }

      if (event.type === "ui.showFlights") {
        setFlights(event.payload.flights);
        setPanelLoading(false);
      }
    });

    const unsubscribeStatus = transport.subscribeConnectionStatus((status) => {
      setConnectionStatus(status);
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

  const onSendMessage = async (text: string) => {
    appendMessage(createMessage("user", text));
    setPanelError(null);
    setIsBusy(true);

    try {
      await transportRef.current?.sendMessage(text);
    } catch {
      setPanelError("No fue posible procesar tu mensaje.");
    } finally {
      setIsBusy(false);
    }
  };

  const formattedRange = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return null;
    }

    return {
      fromDate: dateRange.from.toISOString().slice(0, 10),
      toDate: dateRange.to.toISOString().slice(0, 10),
    };
  }, [dateRange]);

  const onConfirmDates = async () => {
    if (!formattedRange) {
      setPanelError("Debes elegir fecha de ida y vuelta.");
      return;
    }

    setPanelLoading(true);
    setPanelError(null);
    setFlights([]);
    setSelectedFlightId(undefined);

    try {
      await transportRef.current?.sendEvent({
        type: "ui.datesSelected",
        payload: {
          origin: "Madrid",
          destination,
          fromDate: formattedRange.fromDate,
          toDate: formattedRange.toDate,
        },
      });
    } catch {
      setPanelLoading(false);
      setPanelError("No fue posible recuperar vuelos para el rango seleccionado.");
    }
  };

  const onSelectFlight = async (flightId: string) => {
    setSelectedFlightId(flightId);
    setPanelError(null);

    try {
      await transportRef.current?.sendEvent({
        type: "ui.flightSelected",
        payload: {
          flightId,
        },
      });
    } catch {
      setPanelError("No fue posible registrar la selección del vuelo.");
    }
  };

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.page}>
        <header className={styles.header}>
          <Body1Strong>
            {`POC Agencia de Viajes con Agente de IA (${transportMode})`}
          </Body1Strong>
        </header>
        <main className={styles.main}>
          <section className={styles.chatPanel}>
            <ChatPanel
              messages={messages}
              isBusy={isBusy}
              onSendMessage={onSendMessage}
              connectionStatus={connectionStatus}
            />
          </section>
          <section className={styles.richPanel}>
            <RichInteractionPanel
              destination={destination}
              hint={dateHint}
              showDatePicker={showDatePicker}
              dateRange={dateRange}
              flights={flights}
              selectedFlightId={selectedFlightId}
              isLoading={panelLoading}
              error={panelError}
              onDateRangeChange={setDateRange}
              onConfirmDates={onConfirmDates}
              onSelectFlight={onSelectFlight}
            />
          </section>
        </main>
      </div>
    </FluentProvider>
  );
}

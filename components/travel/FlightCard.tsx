"use client";

import { Body1, Body1Strong, Card, Caption1 } from "@fluentui/react-components";
import type { FlightOption } from "@/lib/agent/eventTypes";
import styles from "./FlightCard.module.css";

interface FlightCardProps {
  flight: FlightOption;
  selected: boolean;
  onSelect: (flightId: string) => Promise<void>;
}

export function FlightCard({ flight, selected, onSelect }: FlightCardProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${selected ? styles.selected : ""}`}
      aria-pressed={selected}
      onClick={async () => onSelect(flight.id)}
    >
      <Card className={styles.card}>
        <Body1Strong>{`${flight.airline} · ${flight.id}`}</Body1Strong>
        <Body1>{`${flight.origin} ${flight.departureTime} -> ${flight.destination} ${flight.arrivalTime}`}</Body1>
        <Caption1>{`Duración ${flight.duration} · Escalas ${flight.stops}`}</Caption1>
        <Body1Strong>{`${flight.priceEur} EUR`}</Body1Strong>
      </Card>
    </button>
  );
}

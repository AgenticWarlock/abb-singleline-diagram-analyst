"use client";

import { Body1, Body1Strong, Button, Card, Caption1 } from "@fluentui/react-components";
import type { FlightOption } from "@/lib/agent/eventTypes";
import styles from "./FlightCard.module.css";

interface FlightCardProps {
  flight: FlightOption;
  selected: boolean;
  onSelect: (flightId: string) => Promise<void>;
}

export function FlightCard({ flight, selected, onSelect }: FlightCardProps) {
  return (
    <Card className={`${styles.card} ${selected ? styles.selected : ""}`}>
      <Button
        appearance="transparent"
        className={styles.button}
        aria-pressed={selected}
        onClick={() => onSelect(flight.id)}
      >
        <Body1Strong>{`${flight.airline} · ${flight.id}`}</Body1Strong>
        <Body1>{`${flight.origin} ${flight.departureTime} -> ${flight.destination} ${flight.arrivalTime}`}</Body1>
        <Caption1>{`Duración ${flight.duration} · Escalas ${flight.stops}`}</Caption1>
        <Body1Strong>{`${flight.priceEur} EUR`}</Body1Strong>
      </Button>
    </Card>
  );
}

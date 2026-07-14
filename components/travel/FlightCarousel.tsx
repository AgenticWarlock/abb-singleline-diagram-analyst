"use client";

import { Body1, Body1Strong } from "@fluentui/react-components";
import type { FlightOption } from "@/lib/agent/eventTypes";
import { FlightCard } from "./FlightCard";
import styles from "./FlightCarousel.module.css";

interface FlightCarouselProps {
  flights: FlightOption[];
  selectedFlightId?: string;
  onSelectFlight: (flightId: string) => Promise<void>;
}

export function FlightCarousel({
  flights,
  selectedFlightId,
  onSelectFlight,
}: FlightCarouselProps) {
  if (!flights.length) {
    return <Body1>No hay vuelos disponibles para ese rango.</Body1>;
  }

  return (
    <section aria-label="Vuelos sugeridos" className={styles.wrapper}>
      <Body1Strong>Opciones de vuelo</Body1Strong>
      <div className={styles.list} role="listbox" aria-label="Selecciona un vuelo">
        {flights.map((flight) => (
          <FlightCard
            key={flight.id}
            flight={flight}
            selected={selectedFlightId === flight.id}
            onSelect={onSelectFlight}
          />
        ))}
      </div>
    </section>
  );
}

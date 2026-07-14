"use client";

import { useMemo } from "react";
import { Body1, Button, Card, Caption1 } from "@fluentui/react-components";
import { DayPicker, type DateRange } from "react-day-picker";
import styles from "./TravelDateRangePicker.module.css";

interface TravelDateRangePickerProps {
  destination: string;
  hint: string;
  range: DateRange | undefined;
  onRangeChange: (range: DateRange | undefined) => void;
  onConfirm: () => Promise<void>;
  disabled?: boolean;
}

export function TravelDateRangePicker({
  destination,
  hint,
  range,
  onRangeChange,
  onConfirm,
  disabled = false,
}: TravelDateRangePickerProps) {
  const isValidRange = useMemo(() => Boolean(range?.from && range?.to), [range]);

  return (
    <Card className={styles.card}>
      <Body1>{`Destino: ${destination}`}</Body1>
      <Caption1>{hint}</Caption1>
      <DayPicker
        mode="range"
        selected={range}
        onSelect={onRangeChange}
        disabled={{ before: new Date() }}
        className={styles.picker}
        required
      />
      <Button appearance="primary" onClick={onConfirm} disabled={!isValidRange || disabled}>
        Confirmar fechas
      </Button>
    </Card>
  );
}

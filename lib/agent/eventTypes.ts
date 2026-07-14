export type AgentToUiEventType =
  | "ui.showDatePicker"
  | "ui.showFlights"
  | "ui.showMessage";

export type UiToAgentEventType = "ui.datesSelected" | "ui.flightSelected";

export interface FlightOption {
  id: string;
  airline: string;
  origin: string;
  destination: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  stops: number;
  priceEur: number;
}

export interface ShowDatePickerPayload {
  destination: string;
  hint: string;
}

export interface ShowFlightsPayload {
  destination: string;
  fromDate: string;
  toDate: string;
  flights: FlightOption[];
}

export interface ShowMessagePayload {
  text: string;
}

export interface DatesSelectedPayload {
  origin: string;
  destination: string;
  fromDate: string;
  toDate: string;
}

export interface FlightSelectedPayload {
  flightId: string;
}

export type AgentToUiEvent =
  | { type: "ui.showDatePicker"; payload: ShowDatePickerPayload }
  | { type: "ui.showFlights"; payload: ShowFlightsPayload }
  | { type: "ui.showMessage"; payload: ShowMessagePayload };

export type UiToAgentEvent =
  | { type: "ui.datesSelected"; payload: DatesSelectedPayload }
  | { type: "ui.flightSelected"; payload: FlightSelectedPayload };

export interface ChatMessageModel {
  id: string;
  role: "user" | "agent" | "system";
  text: string;
  timestamp: string;
}

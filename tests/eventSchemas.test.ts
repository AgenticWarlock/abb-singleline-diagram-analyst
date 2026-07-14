import { describe, expect, it } from "vitest";
import { agentToUiEventSchema, uiToAgentEventSchema } from "@/lib/agent/eventSchemas";

describe("eventSchemas", () => {
  it("accepts a valid ui.showFlights event", () => {
    const event = {
      type: "ui.showFlights",
      payload: {
        destination: "Roma",
        fromDate: "2026-10-12",
        toDate: "2026-10-18",
        flights: [
          {
            id: "AZ-1",
            airline: "ITA Airways",
            origin: "MAD",
            destination: "FCO",
            departureTime: "08:00",
            arrivalTime: "10:10",
            duration: "2h 10m",
            stops: 0,
            priceEur: 199,
          },
        ],
      },
    };

    expect(() => agentToUiEventSchema.parse(event)).not.toThrow();
  });

  it("rejects HTML in ui.showMessage", () => {
    const event = {
      type: "ui.showMessage",
      payload: { text: "<b>unsafe</b>" },
    };

    expect(() => agentToUiEventSchema.parse(event)).toThrow();
  });

  it("rejects unknown event types", () => {
    const event = {
      type: "ui.unknown",
      payload: {},
    };

    expect(() => uiToAgentEventSchema.parse(event)).toThrow();
  });
});

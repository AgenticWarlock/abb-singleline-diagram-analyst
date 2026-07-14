import { z } from "zod";

const noHtml = (value: string) => !/<[^>]+>/.test(value);

export const flightOptionSchema = z.object({
  id: z.string().min(1),
  airline: z.string().min(1),
  origin: z.string().min(1),
  destination: z.string().min(1),
  departureTime: z.string().min(1),
  arrivalTime: z.string().min(1),
  duration: z.string().min(1),
  stops: z.number().int().min(0),
  priceEur: z.number().positive(),
});

export const agentToUiEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ui.showDatePicker"),
    payload: z.object({
      destination: z.string().min(1),
      hint: z.string().min(1),
    }),
  }),
  z.object({
    type: z.literal("ui.showFlights"),
    payload: z.object({
      destination: z.string().min(1),
      fromDate: z.string().date(),
      toDate: z.string().date(),
      flights: z.array(flightOptionSchema).min(1),
    }),
  }),
  z.object({
    type: z.literal("ui.showMessage"),
    payload: z.object({
      text: z
        .string()
        .min(1)
        .max(500)
        .refine(noHtml, "Agent messages cannot contain HTML."),
    }),
  }),
]);

export const uiToAgentEventSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("ui.datesSelected"),
    payload: z.object({
      origin: z.string().min(1),
      destination: z.string().min(1),
      fromDate: z.string().date(),
      toDate: z.string().date(),
    }),
  }),
  z.object({
    type: z.literal("ui.flightSelected"),
    payload: z.object({
      flightId: z.string().min(1),
    }),
  }),
]);

export type AgentToUiEventSchema = z.infer<typeof agentToUiEventSchema>;
export type UiToAgentEventSchema = z.infer<typeof uiToAgentEventSchema>;

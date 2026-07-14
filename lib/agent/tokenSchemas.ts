import { z } from "zod";

export const copilotTokenResponseSchema = z.object({
  token: z.string().min(1),
  expires_in: z.number().int().positive(),
  conversationId: z.string().min(1),
});

export type CopilotTokenResponse = z.infer<typeof copilotTokenResponseSchema>;
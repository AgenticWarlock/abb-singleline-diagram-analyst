import type { Activity } from "botframework-directlinejs";
import type { AgentToUiEvent } from "@/lib/agent/eventTypes";

export const isOwnUserMessage = (activity: Activity, userId: string): boolean => {
  return activity.type === "message" && activity.from?.id === userId;
};

export const mapDirectLineActivityToAgentEvent = (
  activity: Activity,
): AgentToUiEvent | null => {
  if (activity.type !== "message") {
    return null;
  }

  const text = activity.text?.trim();
  if (!text) {
    return null;
  }

  return {
    type: "ui.showMessage",
    payload: {
      text,
    },
  };
};
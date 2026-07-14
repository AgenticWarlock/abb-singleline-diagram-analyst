import { describe, expect, it } from "vitest";
import type { Activity } from "botframework-directlinejs";
import {
  isOwnUserMessage,
  mapDirectLineActivityToAgentEvent,
} from "@/lib/agent/directLineAdapters";

describe("directLineAdapters", () => {
  it("converts a message activity into ui.showMessage", () => {
    const activity: Activity = {
      type: "message",
      text: "Hola desde Nauta",
      from: { id: "nauta-bot" },
    };

    const result = mapDirectLineActivityToAgentEvent(activity);

    expect(result).toEqual({
      type: "ui.showMessage",
      payload: {
        text: "Hola desde Nauta",
      },
    });
  });

  it("filters out own user messages", () => {
    const activity: Activity = {
      type: "message",
      text: "mensaje local",
      from: { id: "web-user-1" },
    };

    expect(isOwnUserMessage(activity, "web-user-1")).toBe(true);
  });

  it("does not map non-message activities", () => {
    const activity: Activity = {
      type: "typing",
      from: { id: "nauta-bot" },
    };

    expect(mapDirectLineActivityToAgentEvent(activity)).toBeNull();
  });
});
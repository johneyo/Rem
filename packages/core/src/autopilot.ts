import type { ActionKind } from "./schedule.js";

/** 0 remind me · 1 draft for me · 2 auto-send unless I stop it · 3 full autopilot. */
export type AutopilotLevel = 0 | 1 | 2 | 3;

export type ActionMode = "remind" | "draft" | "preview_then_send" | "send";

export interface AutopilotContext {
  level: AutopilotLevel;
  kind: ActionKind;
  /** Required data the action still lacks (see completeness.ts). */
  missing: readonly string[];
  /** Occasion came from online discovery rather than from the user or the person. */
  discovered?: boolean;
  /** Memorials and similar dates are never sent automatically. */
  sensitive?: boolean;
  doNotContact?: boolean;
  /** Spend still available for this action, in cents; undefined when the action costs nothing. */
  budgetRemainingCents?: number;
  costCents?: number;
  /** The user's global pause switch. */
  paused?: boolean;
}

export interface AutopilotDecision {
  mode: ActionMode;
  /** Why the mode is lower than the configured level, for the UI. */
  reason?: string;
}

const MODE_BY_LEVEL: Record<AutopilotLevel, ActionMode> = {
  0: "remind",
  1: "draft",
  2: "preview_then_send",
  3: "send",
};

/**
 * Decide how an action is handled. Anything unusual lowers the level, never raises it,
 * and a blocked auto-send falls back to a draft for approval instead of being skipped.
 */
export function decideMode(ctx: AutopilotContext): AutopilotDecision {
  if (ctx.doNotContact) return { mode: "remind", reason: "Marked do-not-contact" };
  if (ctx.sensitive) return { mode: "remind", reason: "Sensitive occasion" };

  const wanted = MODE_BY_LEVEL[ctx.level];
  if (wanted === "remind") return { mode: "remind" };

  if (ctx.missing.length > 0) return { mode: "draft", reason: `Missing: ${ctx.missing.join(", ")}` };
  if (wanted === "draft") return { mode: "draft" };

  if (ctx.paused) return { mode: "draft", reason: "Autopilot is paused" };
  if (ctx.discovered) return { mode: "draft", reason: "Found online; please confirm" };
  if (
    ctx.costCents !== undefined &&
    ctx.costCents > 0 &&
    (ctx.budgetRemainingCents === undefined || ctx.costCents > ctx.budgetRemainingCents)
  ) {
    return { mode: "draft", reason: "Over budget" };
  }
  return { mode: wanted };
}

import { Static, t } from "elysia";
import { match } from "ts-pattern";

export const pastTimePeriod = t.Optional(
  t.Union([
    t.Literal("day"),
    t.Literal("week"),
    t.Literal("month"),
    t.Literal("year"),
  ]),
);

export type PastTimePeriod = Static<typeof pastTimePeriod>;

export const getPastStartTime = (past: PastTimePeriod) => {
  const now = new Date();
  // TODO: verify that this is actually correct
  match(past)
    .with("day", () => now.setHours(0, 0, 0, 0))
    .with("week", () => now.setDate(now.getDate() - 7))
    .with("month", () => now.setMonth(now.getMonth() - 1))
    .with("year", () => now.setFullYear(now.getFullYear() - 1))
    .exhaustive();
  return now;
};

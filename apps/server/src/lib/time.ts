import { TimePeriod } from "@cloud/shared";
import { match } from "ts-pattern";

export const getPastStartTime = (past: TimePeriod) => {
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

import { t, Static } from "elysia";

export const timePeriod = t.Union([
  t.Literal("day"),
  t.Literal("week"),
  t.Literal("month"),
  t.Literal("year"),
]);

export type TimePeriod = Static<typeof timePeriod>;

export const timeFilterQueryParams = t.Object({
  past: t.Optional(timePeriod),
  from: t.Optional(t.Date()),
  to: t.Optional(t.Date()),
});

export type TimeFilterQueryParams = Static<typeof timeFilterQueryParams>;

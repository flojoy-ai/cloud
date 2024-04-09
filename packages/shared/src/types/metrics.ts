import { t, Static } from "elysia";

export const pastTimePeriod = t.Optional(
  t.Union([
    t.Literal("day"),
    t.Literal("week"),
    t.Literal("month"),
    t.Literal("year"),
  ]),
);

export type PastTimePeriod = Static<typeof pastTimePeriod>;

export const timeFilterQueryParams = t.Object({
  past: pastTimePeriod,
  from: t.Optional(t.Date()),
  to: t.Optional(t.Date()),
});

export type TimeFilterQueryParams = Static<typeof timeFilterQueryParams>;

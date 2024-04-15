import { TimePeriod } from "@cloud/shared";

export const addDays = (date: Date, days: number) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

export const pastTimeFromBin = (bin: TimePeriod) => {
  switch (bin) {
    case "day":
      return "week";
    case "week":
      return "month";
    case "month":
      return "year";
    case "year":
      return undefined;
  }
};

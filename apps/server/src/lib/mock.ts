import { TimePeriod } from "@cloud/shared";
import _ from "lodash/fp";
import { faker } from "@faker-js/faker";
import { truncateDate } from "./time";

export const recentDateWithinBin = (bin: TimePeriod) => {
  return truncateDate(
    faker.date.recent({
      days:
        bin === "day" ? 7 : bin === "week" ? 60 : bin === "month" ? 365 : 2000,
    }),
    bin,
  );
};

export const fakeTimeSeries = (bin: TimePeriod) => {
  return _.pipe(
    _.range(0),
    _.map(() => ({
      count: faker.number.int({ min: 0, max: 1000 }),
      bin: recentDateWithinBin(bin),
    })),
    _.sortBy((d) => d.bin),
    _.uniqBy((d) => d.bin.getTime()),
  )(100);
};

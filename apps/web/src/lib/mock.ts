import { faker } from "@faker-js/faker";

import _ from "lodash/fp";

import { TimePeriod } from "@cloud/shared";

const SERIAL_NUMBERS = _.range(0, 10).map(() => faker.word.noun());

export function fakeMeasurement() {
  return {
    serialNumber: faker.helpers.arrayElement(SERIAL_NUMBERS),
    data: { value: normalDist() },
    pass: faker.helpers.arrayElement([true, false, null]),
    aborted: faker.helpers.arrayElement([true, false]),
    createdAt: faker.date.recent(),
  };
}

const truncateDate = (date: Date, bin: TimePeriod) => {
  switch (bin) {
    case "day":
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    case "week":
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    case "month":
      return new Date(date.getFullYear(), date.getMonth());
    case "year":
      return new Date(date.getFullYear(), 0);
  }
};

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

function normalDist() {
  let u = 0;
  let v = 0;
  while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
  while (v === 0) v = Math.random();
  let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  num = num / 10.0 + 0.5; // Translate to 0 -> 1
  if (num > 1 || num < 0) return normalDist(); // resample between 0 and 1
  return num;
}

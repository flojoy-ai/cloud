export const computePassingStatus = (data: { pass: boolean | null }[]) => {
  // const latest = _.values(_.groupBy(measurements, (meas) => meas.testId)).map(
  //   (meas) => meas[0]!,
  // );

  let unevaluatedCount = 0;
  let passCount = 0;
  let failCount = 0;

  for (const d of data) {
    if (d.pass === null) {
      unevaluatedCount++;
    } else if (d.pass) {
      passCount++;
    } else {
      failCount++;
    }
  }

  const passing = failCount > 0 ? false : unevaluatedCount > 0 ? null : true;

  return {
    passing,
    passCount,
    unevaluatedCount: unevaluatedCount,
    failCount,
  };
};

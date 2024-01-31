"use client";

import _ from "lodash";
import { useMemo, useState } from "react";
import { MeasurementsDataTable } from "~/components/measurements-data-table";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { type MeasurementWithHardware } from "~/types/measurement";
import { HelpCircle, Check, X } from "lucide-react";

type Props = {
  hardwareId: string;
  namespace: string;
  initialMeasurements: MeasurementWithHardware[];
};

const computePassingStatus = (measurements: MeasurementWithHardware[]) => {
  const latest = _.values(_.groupBy(measurements, (meas) => meas.testId)).map(
    (meas) => meas[0]!,
  );

  let undecidedCount = 0;
  let passCount = 0;
  let failCount = 0;

  for (const meas of latest) {
    if (meas.pass === null) {
      undecidedCount++;
    } else if (meas.pass) {
      passCount++;
    } else {
      failCount++;
    }
  }

  const passing = failCount > 0 ? false : passCount > 0 ? true : null;

  return {
    passing,
    passCount,
    unevaluatedCount: undecidedCount,
    failCount,
  };
};

function pickTernary<T>(ternary: boolean | null, a: T, b: T, c: T) {
  switch (ternary) {
    case true:
      return a;
    case false:
      return b;
    case null:
      return c;
  }
}

export default function HardwareMeasurements({
  hardwareId,
  initialMeasurements,
  namespace,
}: Props) {
  const [showLatest, setShowLatest] = useState<boolean>(true);

  const { data } = api.measurement.getAllMeasurementsByHardwareId.useQuery(
    {
      hardwareId: hardwareId,
      latest: showLatest,
    },
    {
      initialData: initialMeasurements,
    },
  );

  const status = useMemo(() => computePassingStatus(data), [data]);

  return (
    <div>
      <Card className="mx-auto w-fit p-4 text-center">
        <div
          className={cn(
            "flex items-center justify-center gap-2 text-2xl font-bold",
            pickTernary(
              status.passing,
              "text-green-500",
              "text-red-500",
              "text-muted-foreground",
            ),
          )}
        >
          {pickTernary(
            status.passing,
            "Passing" + (status.unevaluatedCount > 0 ? "*" : ""),
            "Failing",
            "Unevaluated",
          )}
          {pickTernary(status.passing, <Check />, <X />, <></>)}
        </div>
        <div className="py-2" />
        <div className="text-sm text-muted-foreground">
          <span>{status.passCount} passing</span>,{" "}
          <span>{status.failCount} failed</span>,{" "}
          <span>{status.unevaluatedCount} unevaluated</span>
        </div>
      </Card>
      <div className="py-4" />
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={showLatest}
            onCheckedChange={(state) =>
              setShowLatest(state.valueOf() as boolean)
            }
          />
          <Label>Only show latest measurements per test</Label>
        </div>
      </Card>
      <div className="py-2" />
      <MeasurementsDataTable measurements={data} namespace={namespace} />
    </div>
  );
}

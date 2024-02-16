import { Card, CardContent, CardHeader, CardTitle } from "@cloud/ui/components/ui/card";
import Histogram from "~/components/visualization/plot/histogram";
import { type SelectMeasurement } from "~/types/measurement";

import { type z } from "zod";
import { explorerConfig } from "~/types/data";
import { useCallback, useState } from "react";
import { type PlotMouseEvent } from "plotly.js";
import { useRouter } from "next/navigation";

type Props = {
  measurements: SelectMeasurement[];
  title?: string;
  workspaceId: string;
};

const ScalarViz = ({ measurements, title, workspaceId }: Props) => {
  const router = useRouter();

  const handleClick = useCallback(
    (event: Readonly<PlotMouseEvent>) => {
      const curveNumber = event.points[0]?.pointIndex;
      if (!curveNumber) {
        return;
      }
      const measurement = measurements[curveNumber];
      if (!measurement) {
        return;
      }
      router.push(
        `/workspace/${workspaceId}/hardware/${measurement.hardwareId}`,
      );
    },
    [measurements, router, workspaceId],
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Visualization Options</CardTitle>
        </CardHeader>
        <CardContent></CardContent>
      </Card>

      <Card className="p-2">
        {measurements && (
          <Histogram
            title={title ?? "Untitled Test"}
            x={measurements.map((measurement) => measurement.hardware.name)}
            y={measurements.map((measurement) => {
              if (measurement.data.type === "scalar") {
                return measurement.data.value;
              }
              return 0;
            })}
            onTraceClick={handleClick}
          />
        )}
      </Card>
    </>
  );
};

export default ScalarViz;

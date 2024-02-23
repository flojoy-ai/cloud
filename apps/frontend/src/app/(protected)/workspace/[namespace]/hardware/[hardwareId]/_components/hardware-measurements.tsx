"use client";

import _ from "lodash";
import { useState } from "react";
import { MeasurementsDataTable } from "~/components/measurements-data-table";
import { Card } from "@cloud/ui/components/ui/card";
import { Checkbox } from "@cloud/ui/components/ui/checkbox";
import { Label } from "@cloud/ui/components/ui/label";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
import { Check, X, Upload } from "lucide-react";
import { HardwareStatus, HardwareTree } from "~/types/hardware";
import { usePaginate } from "~/hooks/use-paginate";

type Props = {
  hardwareId: string;
  hardware: HardwareTree;
  namespace: string;
  initialStatus: HardwareStatus;
};

function pickTernary<T, U, V>(ternary: boolean | null, a: T, b: U, c: V) {
  switch (ternary) {
    case true:
      return a;
    case false:
      return b;
    case null:
      return c;
  }
}

const PAGE_SIZE = 10;

export default function HardwareMeasurements({
  hardwareId,
  initialStatus,
  namespace,
}: Props) {
  const [showLatest, setShowLatest] = useState<boolean>(true);
  const [query, setQuery] = useState<string | undefined>(undefined);
  const [tag, setTag] = useState<string | undefined>(undefined);

  const { data, prev, hasPrevPage, next, hasNextPage, reset } = usePaginate(
    api.measurement.getAllMeasurementsByHardwareIdPaginated,
    {
      hardwareId,
      pageSize: PAGE_SIZE,
      name: query,
      tags: tag ? [tag] : undefined,
    },
  );

  const { data: status } = api.hardware.getHardwareStatus.useQuery(
    {
      hardwareId: hardwareId,
    },
    {
      initialData: initialStatus,
    },
  );

  if (
    status.passCount === 0 &&
    status.failCount === 0 &&
    status.unevaluatedCount === 0
  ) {
    return (
      <div className="mt-24 flex flex-col items-center justify-center text-center text-muted-foreground">
        <Upload size={40} />
        <div className="py-1" />
        <div>
          No tests have been performed on this hardware yet, try uploading some
          through the{" "}
          <a
            href="https://rest.flojoy.ai/api-reference"
            className="underline hover:text-muted-foreground/70"
          >
            REST API
          </a>
          .
        </div>
      </div>
    );
  }

  return (
    <div>
      <Card className="w-fit p-4 text-center">
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
          {pickTernary(status.passing, "Passing", "Failing", "Unevaluated")}
          {pickTernary(status.passing, <Check />, <X />, <></>)}
        </div>
        <div className="py-2" />
        <div className="text-sm text-muted-foreground">
          <span>{status.passCount} passed</span>,{" "}
          <span>{status.failCount} failed</span>,{" "}
          <span>{status.unevaluatedCount} unevaluated</span>
        </div>
      </Card>

      <div className="py-4" />

      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Checkbox
            checked={showLatest}
            onCheckedChange={(state) => {
              setShowLatest(state.valueOf() as boolean);
              reset();
            }}
          />
          <Label>Only show latest measurements per test</Label>
        </div>
      </Card>
      <div className="py-2" />
      <MeasurementsDataTable
        pageSize={PAGE_SIZE}
        data={data}
        namespace={namespace}
        tag={tag}
        query={query}
        setTag={(val) => {
          setTag(val);
          reset();
        }}
        setQuery={(val) => {
          setQuery(val);
          reset();
        }}
        next={next}
        prev={prev}
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
      />
    </div>
  );
}

import Link from "next/link";
import { Card } from "~/components/ui/card";
import DataframeViz from "~/components/visualization/dataframe-viz";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/server";
import { type BooleanData } from "~/types/data";

type BooleanVizProps = {
  data: BooleanData;
};

const BooleanViz = ({ data }: BooleanVizProps) => {
  return (
    <Card className="w-fit p-4">
      <div
        className={cn(
          data.passed ? "text-green-500" : "text-red-500",
          "text-xl",
        )}
      >
        {data.passed ? "Passed" : "Failed"}
      </div>
    </Card>
  );
};

export default async function Measurement({
  params,
}: {
  params: { measurementId: string; namespace: string };
}) {
  const measurement = await api.measurement.getMeasurementById.query({
    measurementId: params.measurementId,
  });
  const workspaceId = await api.workspace.getWorkspaceIdByNamespace.query({
    namespace: params.namespace,
  });

  let visualization;

  switch (measurement.data.type) {
    case "boolean":
      visualization = <BooleanViz data={measurement.data} />;
      break;
    case "dataframe":
      visualization = (
        <DataframeViz
          measurements={[measurement]}
          title={measurement.name ?? "Untitled Measurement"}
          workspaceId={workspaceId}
        />
      );
      break;
  }

  return (
    <div className="h-screen p-8">
      <h1 className="text-3xl font-bold">{measurement.name}</h1>
      <div className="text-base text-muted-foreground">
        {params.measurementId}
      </div>
      <div className="py-2" />
      <div className="text-muted-foreground">
        {measurement.createdAt.toString()}
      </div>
      <Link
        className="text-lg"
        href={`/workspace/${params.namespace}/device/${measurement.device.id}`}
      >
        {measurement.device.name}
      </Link>
      <div className="py-4" />
      {visualization}
    </div>
  );
}

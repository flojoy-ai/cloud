import Link from "next/link";
import BackButton from "~/components/back-button";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/small-header";
import { Badge } from "~/components/ui/badge";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import DataframeViz from "~/components/visualization/dataframe-viz";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/server";
import { type ScalarData, type BooleanData } from "~/types/data";

type BooleanVizProps = {
  data: BooleanData;
};

const BooleanViz = ({ data }: BooleanVizProps) => {
  return (
    <Card className="w-fit p-4">
      <div
        className={cn(
          data.value ? "text-green-500" : "text-red-500",
          "text-xl",
        )}
      >
        {data.value.toString()}
      </div>
    </Card>
  );
};

type ScalarVizProps = {
  data: ScalarData;
};

const ScalarViz = ({ data }: ScalarVizProps) => {
  return (
    <Card className="w-fit p-4">
      <div className={"text-xl"}>{data.value}</div>
    </Card>
  );
};

export default async function Measurement({
  params,
  searchParams,
}: {
  params: { measurementId: string; namespace: string };
  searchParams: { back?: string };
}) {
  const measurement = await api.measurement.getMeasurementById.query({
    measurementId: params.measurementId,
  });
  const workspaceId = await api.workspace.getWorkspaceIdByNamespace.query({
    namespace: params.namespace,
  });
  const model = await api.model.getModelById.query({
    modelId: measurement.hardware.modelId,
  });

  let visualization;

  switch (measurement.data.type) {
    case "boolean":
      visualization = <BooleanViz data={measurement.data} />;
      break;
    case "scalar":
      visualization = <ScalarViz data={measurement.data} />;
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
    <div className="container max-w-screen-2xl">
      <PageHeader>
        {searchParams.back && <BackButton />}

        <PageHeaderHeading className="">{measurement.name}</PageHeaderHeading>
        <PageHeaderDescription>{measurement.id}</PageHeaderDescription>
      </PageHeader>

      <Separator className="my-6" />

      <div>
        <div>Taken at: {measurement.createdAt.toString()}</div>
        <div>
          Hardware instance:{" "}
          <Badge>
            <Link
              href={`/workspace/${params.namespace}/hardware/${measurement.hardware.id}`}
            >
              {model.name} {measurement.hardware.name}
            </Link>
          </Badge>
        </div>
      </div>

      <div className="py-4" />
      {visualization}
    </div>
  );
}

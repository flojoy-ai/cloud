import Link from "next/link";
import BackButton from "~/components/back-button";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/small-header";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
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
          data.value ? "text-green-500" : "text-red-500",
          "text-xl",
        )}
      >
        {data.value.toString()}
      </div>
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
    <div className="container max-w-screen-2xl">
      <PageHeader>
        {searchParams.back && <BackButton />}

        <PageHeaderHeading className="">{measurement.name}</PageHeaderHeading>
        <PageHeaderDescription>
          {measurement.createdAt.toString()}
        </PageHeaderDescription>
      </PageHeader>

      <Separator className="my-6" />

      <Button asChild>
        <Link
          href={`/workspace/${params.namespace}/hardware/${measurement.hardware.id}`}
        >
          {measurement.hardware.model.name} {measurement.hardware.name}
        </Link>
      </Button>

      <div className="py-4" />
      {visualization}
    </div>
  );
}

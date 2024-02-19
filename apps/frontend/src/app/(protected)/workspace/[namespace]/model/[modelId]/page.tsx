import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/small-header";
import { api } from "~/trpc/server";
import TreeVisualization, {
  ModelTreeVisualization,
} from "~/components/visualization/tree-visualization";

export default async function ModelInfo({
  params,
}: {
  params: { namespace: string; modelId: string };
}) {
  const model = await api.model.getModel({ modelId: params.modelId });

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading>{model.name}</PageHeaderHeading>
        <PageHeaderDescription>
          Here you can find information about this model.
        </PageHeaderDescription>
      </PageHeader>

      <div className="h-screen w-screen">
        <ModelTreeVisualization tree={model} />
      </div>

      <div className="py-4" />
    </div>
  );
}

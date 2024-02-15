import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "~/components/small-header";

import { api } from "~/trpc/server";
import HardwareMeasurements from "./_components/hardware-measurements";
import BackButton from "~/components/back-button";
import SwapHardware from "~/components/hardware/swap-hardware";
import RevisionHistory from "~/components/hardware/revision-history";
import ComponentGraph from "./_components/component-graph";

export default async function Hardware({
  params,
  searchParams,
}: {
  params: { hardwareId: string; namespace: string };
  searchParams: { back?: string };
}) {
  const hardware = await api.hardware.getHardware.query({
    hardwareId: params.hardwareId,
  });
  const revisions = await api.hardware.getRevisions.query({
    hardwareId: params.hardwareId,
  });
  const measurements =
    await api.measurement.getAllMeasurementsByHardwareId.query({
      hardwareId: params.hardwareId,
      latest: true,
    });
  const workspaceId = await api.workspace.getWorkspaceIdByNamespace.query({
    namespace: params.namespace,
  });

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        {searchParams.back && <BackButton />}
        <PageHeaderHeading className="">
          <div className="flex items-center gap-x-2">
            <div>{hardware.name}</div>
            {hardware.components.length > 0 && (
              <>
                <SwapHardware hardware={hardware} workspaceId={workspaceId} />
                <RevisionHistory
                  revisions={revisions}
                  hardwareId={hardware.id}
                />
              </>
            )}
          </div>
        </PageHeaderHeading>
        <PageHeaderDescription>
          All tests that have been performed on &quot;{hardware.name}&quot; are
          listed here.
        </PageHeaderDescription>
      </PageHeader>

      <ComponentGraph tree={hardware} />

      <div className="py-4" />

      <HardwareMeasurements
        hardwareId={params.hardwareId}
        hardware={hardware}
        namespace={params.namespace}
        initialMeasurements={measurements}
      />
    </div>
  );
}

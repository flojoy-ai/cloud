"use client";

import { type SelectModel } from "~/types/model";
import DeviceCard from "./device-card";
import { type SelectHardware } from "~/types/hardware";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { useState } from "react";

type Props = {
  hardwares: (SelectHardware & { model: SelectModel })[];
  workspaceId: string;
  namespace: string;
  projectId: string;
};

const AllHardwares = (props: Props) => {
  const { data: hardwares } = api.hardware.getAllHardware.useQuery(
    {
      workspaceId: props.workspaceId,
      projectId: props.projectId,
    },
    {
      initialData: props.hardwares,
    },
  );

  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <Input
        placeholder="Search hardware instance"
        className="max-w-lg"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {hardwares.length === 0 && (
        <div className="">
          No hardare instance found, get started by registering your hardware
          instance.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {hardwares
          .filter(
            (h) =>
              !searchTerm ||
              h.name.toLowerCase().includes(searchTerm.toLowerCase()),
          )
          .map((hardware) => (
            <DeviceCard
              hardware={hardware}
              key={hardware.id}
              namespace={props.namespace}
            />
          ))}
      </div>
    </div>
  );
};

export default AllHardwares;

"use client";

import CreateDevice from "./create-device";
import CreateSystem from "./create-system";
import {
  type SelectSystemModel,
  type SelectModel,
  type SelectDeviceModel,
} from "~/types/model";
import DeviceCard from "./device-card";
import { type SelectHardware } from "~/types/hardware";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import { type SelectProject } from "~/types/project";
import { Badge } from "~/components/ui/badge";

type Props = {
  hardwares: SelectHardware[];
  workspaceId: string;
  namespace: string;
  project: SelectProject & { model: SelectModel };
};

const isSystemProject = (
  project: SelectProject & { model: SelectSystemModel | SelectDeviceModel },
): project is SelectProject & { model: SelectSystemModel } => {
  return project.model.type === "system";
};

const AllHardwares = (props: Props) => {
  const { data: hardwares } = api.hardware.getAllHardware.useQuery(
    {
      workspaceId: props.workspaceId,
      projectId: props.project.id,
    },
    {
      initialData: props.hardwares,
    },
  );

  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        {isSystemProject(props.project) ? (
          <CreateSystem project={props.project} />
        ) : (
          <CreateDevice project={props.project} />
        )}
        <div>
          You can only register instances of{" "}
          <Badge>{props.project.model.name}</Badge> to this project.
        </div>
        <div className="grow"></div>
        <Input
          placeholder="Search hardware instance"
          className="max-w-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
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

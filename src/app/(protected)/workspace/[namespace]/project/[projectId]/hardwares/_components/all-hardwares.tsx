"use client";

import CreateDevice from "~/components/hardware/create-device";
import CreateSystem from "~/components/hardware/create-system";
import { type SelectModel } from "~/types/model";
import DeviceCard from "./device-card";
import { type SelectHardware } from "~/types/hardware";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import { type SelectProject } from "~/types/project";
import { Badge } from "~/components/ui/badge";
import { PlusCircle } from "lucide-react";
import ImportHardware from "./import-hardware";

type Props = {
  hardwares: SelectHardware[];
  modelHardware: SelectHardware[];
  workspaceId: string;
  namespace: string;
  project: SelectProject & { model: SelectModel };
};

const AllHardwares = ({
  workspaceId,
  hardwares: initialHardwares,
  modelHardware,
  namespace,
  project,
}: Props) => {
  const { data: hardwares } = api.hardware.getAllHardware.useQuery(
    {
      workspaceId,
      projectId: project.id,
    },
    {
      initialData: initialHardwares,
    },
  );

  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <ImportHardware
          workspaceId={workspaceId}
          project={project}
          initialHardware={modelHardware}
          projectHardware={hardwares}
        />
        {project.model.type === "system" ? (
          <CreateSystem
            workspaceId={workspaceId}
            model={project.model}
            projectId={project.id}
          >
            <div className="flex items-center gap-2">
              <PlusCircle size={20} />
              <div>Register System Instance</div>
            </div>
          </CreateSystem>
        ) : (
          <CreateDevice
            workspaceId={workspaceId}
            model={project.model}
            projectId={project.id}
          >
            <div className="flex items-center gap-2">
              <PlusCircle size={20} />
              <div>Register Device Instance</div>
            </div>
          </CreateDevice>
        )}
      </div>
      <div className="text-muted-foreground">
        You can only register instances of <Badge>{project.model.name}</Badge>{" "}
        to this project.
      </div>
      <Input
        placeholder="Search hardware..."
        className="max-w-lg"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {hardwares.length === 0 && (
        <div className="">
          No hardware instance found, get started by registering your hardware
          instance.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
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
              namespace={namespace}
            />
          ))}
      </div>
    </div>
  );
};

export default AllHardwares;

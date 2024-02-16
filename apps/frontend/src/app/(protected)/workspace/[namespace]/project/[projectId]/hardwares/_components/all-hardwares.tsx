"use client";

import CreateHardware from "~/components/hardware/create-hardware";
import DeviceCard from "./device-card";
import { api } from "~/trpc/react";
import { Input } from "~/components/ui/input";
import { useState } from "react";
import { Badge } from "~/components/ui/badge";
import { PlusCircle } from "lucide-react";
import ImportHardware from "./import-hardware";
import { Hardware } from "~/schemas/public/Hardware";
import { Model } from "~/schemas/public/Model";
import { Project } from "~/schemas/public/Project";

type Props = {
  hardwares: (Hardware & { model: Model; projects: Project[] })[];
  models: Model[];
  modelHardware: (Hardware & { model: Model; projects: Project[] })[];
  workspaceId: string;
  namespace: string;
  project: Project & { model: Model };
};

const AllHardwares = ({
  workspaceId,
  hardwares: initialHardwares,
  modelHardware,
  models: initialModels,
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
  const { data: models } = api.model.getAllModels.useQuery(
    {
      workspaceId,
    },
    {
      initialData: initialModels,
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
        <CreateHardware
          workspaceId={workspaceId}
          model={project.model}
          models={models}
          projectId={project.id}
        >
          <div className="flex items-center gap-2">
            <PlusCircle size={20} />
            <div>Register Instance</div>
          </div>
        </CreateHardware>
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

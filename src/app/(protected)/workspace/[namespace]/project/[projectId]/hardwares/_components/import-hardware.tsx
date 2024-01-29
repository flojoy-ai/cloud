"use client";

import { useMemo, useState } from "react";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/data-table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { hardwareColumns } from "./columns";
import { api } from "~/trpc/react";
import { type SelectProject } from "~/types/project";
import { type SelectHardware } from "~/types/hardware";

type Props = {
  workspaceId: string;
  project: SelectProject;
  initialHardware: SelectHardware[];
  projectHardware: SelectHardware[];
};

const ImportHardware = ({
  workspaceId,
  project,
  initialHardware,
  projectHardware,
}: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [hardwareIds, setHardwareIds] = useState<string[]>([]);

  const { data: hardware } = api.hardware.getAllHardware.useQuery(
    {
      workspaceId,
      modelId: project.modelId,
    },
    { initialData: initialHardware },
  );

  const addHardware = api.project.addHardwareToProject.useMutation();

  const tableData = useMemo(
    () =>
      hardware.filter(
        (h) => projectHardware.find((x) => x.id === h.id) === undefined,
      ),
    [hardware, projectHardware],
  );

  const handleSubmit = async () => {
    for (const hardwareId of hardwareIds) {
      await addHardware.mutateAsync({ projectId: project.id, hardwareId });
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Import from inventory
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Import Hardware from Inventory</DialogTitle>
          <DialogDescription>
            Which hardware are you testing in this project?
          </DialogDescription>
        </DialogHeader>
        <div className="h-96 overflow-y-auto">
          <DataTable
            columns={hardwareColumns}
            data={tableData}
            onSelectionChange={(model) => {
              setHardwareIds(model.rows.map((row) => hardware[row.index]!.id));
            }}
          />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={handleSubmit}>
              Close
            </Button>
          </DialogClose>
          <Button size="default">Import</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportHardware;

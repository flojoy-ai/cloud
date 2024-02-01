"use client";

import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
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
import { toast } from "sonner";
import { ArchiveRestore } from "lucide-react";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { ControlledDataTable } from "~/components/ui/controlled-data-table";
import { handleTrpcError } from "~/lib/utils";

type Props = {
  workspaceId: string;
  project: SelectProject;
  initialHardware: SelectHardware[];
  projectHardware: SelectHardware[];
};

const getSelectionState = (
  hardware: SelectHardware[],
  projectHardware: SelectHardware[],
) =>
  Object.fromEntries(
    hardware.map((h, i) => [
      i.toString(),
      projectHardware.find((ph) => ph.id === h.id) !== undefined,
    ]),
  );

const ImportHardware = ({
  workspaceId,
  project,
  initialHardware,
  projectHardware,
}: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const utils = api.useUtils();

  const { data: hardware } = api.hardware.getAllHardware.useQuery(
    {
      workspaceId,
      modelId: project.modelId,
    },
    { initialData: initialHardware },
  );

  const setProjectHardware = api.project.setProjectHardware.useMutation();

  const table = useReactTable({
    data: hardware,
    columns: hardwareColumns,
    getCoreRowModel: getCoreRowModel(),
    initialState: {
      rowSelection: getSelectionState(hardware, projectHardware),
    },
  });

  useEffect(() => {
    table.setRowSelection(getSelectionState(hardware, projectHardware));
  }, [hardware, projectHardware]);

  const handleSubmit = () => {
    const hardwareIds = table
      .getSelectedRowModel()
      .rows.map((row) => row.original.id);

    toast.promise(
      setProjectHardware.mutateAsync(
        {
          projectId: project.id,
          hardwareIds,
        },
        {
          onSettled: () => {
            setIsDialogOpen(false);
            void utils.hardware.getAllHardware.invalidate();
          },
        },
      ),
      {
        success: "Project hardware updated.",
        loading: "Updating...",
        error: handleTrpcError,
      },
    );
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <div className="flex items-center gap-2">
            <ArchiveRestore size={20} />
            <div>Import From Inventory</div>
          </div>
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
          <ControlledDataTable columns={hardwareColumns} table={table} />
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary" onClick={handleSubmit}>
              Close
            </Button>
          </DialogClose>
          <Button size="default" onClick={handleSubmit}>
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImportHardware;

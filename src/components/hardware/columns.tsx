"use client";

import { MoreHorizontal } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";

import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { type ColumnDef } from "@tanstack/react-table";
import { type SelectSystem, type SelectDevice } from "~/types/hardware";
import { toast } from "sonner";
import {
  type SelectSystemModel,
  type SelectDeviceModel,
  type SelectModel,
} from "~/types/model";
import { Badge } from "../ui/badge";
import _ from "lodash";
import { useState } from "react";
import { api } from "~/trpc/react";

type ActionsProps = {
  elem: { id: string };
  children?: React.ReactNode;
};

const Actions = ({ elem, children }: ActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() =>
            toast.promise(navigator.clipboard.writeText(elem.id), {
              success: "Copied to clipboard",
              error: "Something went wrong :(",
            })
          }
        >
          Copy ID
        </DropdownMenuItem>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const deviceColumns: ColumnDef<SelectDevice>[] = [
  {
    accessorKey: "name",
    header: "Device Name",
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.name}</Badge>;
    },
  },
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => {
      return <Badge>{row.original.model.name}</Badge>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const [isOpen, setIsOpen] = useState(false);
      const deleteHardware = api.hardware.deleteHardwareById.useMutation();
      const utils = api.useUtils();
      return (
        <>
          <AlertDialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your device instance and remove your data from our servers.{" "}
                  <br /> This device instance can only be deleted if it is{" "}
                  <b>not within a system.</b>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogContent>
                {/* TODO: Show a list of systems that use this device*/}
              </AlertDialogContent>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    toast.promise(
                      deleteHardware.mutateAsync(
                        {
                          hardwareId: row.original.id,
                        },
                        {
                          onSuccess: () => {
                            void utils.hardware.getAllDevices.invalidate();
                          },
                        },
                      ),
                      {
                        loading: "Deleting your device instance...",
                        success: "Your device instance has been deleted.",
                        error: "Something went wrong :(",
                      },
                    )
                  }
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Actions elem={row.original}>
            <DropdownMenuItem onClick={() => setIsOpen(true)}>
              Delete
            </DropdownMenuItem>
          </Actions>
        </>
      );
    },
  },
];

export const systemColumns: ColumnDef<SelectSystem>[] = [
  {
    accessorKey: "name",
    header: "System Name",
    cell: ({ row }) => {
      return <Badge variant="secondary">{row.original.name}</Badge>;
    },
  },
  {
    accessorKey: "model",
    header: "Model",
    cell: ({ row }) => {
      return <Badge>{row.original.model.name}</Badge>;
    },
  },
  {
    accessorKey: "parts",
    header: "Components",
    cell: ({ row }) => {
      const byModel = _.groupBy(row.original.parts, (p) => p.model.name);

      return (
        <div className="flex flex-col gap-2">
          {Object.entries(byModel).map(([modelName, devices]) => (
            <div className="flex items-start gap-1">
              <Badge className="">{modelName}</Badge>
              <div className="flex flex-col gap-1">
                {devices.map((d) => (
                  <Badge variant="secondary" key={d.id}>
                    {d.name}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const [isOpen, setIsOpen] = useState(false);
      const deleteHardware = api.hardware.deleteHardwareById.useMutation();
      const utils = api.useUtils();
      return (
        <>
          <AlertDialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your system instance and remove your data from our servers.{" "}
                  <br />
                  The device instances within this system{" "}
                  <b>will not be removed.</b>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogContent></AlertDialogContent>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() =>
                    toast.promise(
                      deleteHardware.mutateAsync(
                        {
                          hardwareId: row.original.id,
                        },
                        {
                          onSuccess: () => {
                            void utils.hardware.getAllSystems.invalidate();
                          },
                        },
                      ),
                      {
                        loading: "Deleting your system instance...",
                        success: "Your system instance has been deleted.",
                        error: "Something went wrong :(",
                      },
                    )
                  }
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Actions elem={row.original}>
            <DropdownMenuItem onClick={() => setIsOpen(true)}>
              Delete
            </DropdownMenuItem>
          </Actions>
        </>
      );
    },
  },
];

type DeleteDialogProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  model: SelectModel;
  onSuccess: () => void;
};

const DeleteDialog = ({
  isOpen,
  setIsOpen,
  model,
  onSuccess,
}: DeleteDialogProps) => {
  const deleteModel = api.model.deleteModel.useMutation();
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            model and remove your data from our servers. <br /> This model can
            only be deleted if there are:
            <ul className="list-inside list-disc">
              <li>no hardware instances of this model. </li>
              <li>no projects using this model.</li>
              <li>no system models using this device model. </li>
            </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogContent>
          {/* TODO: Show a list of devices or systems that use this model */}
        </AlertDialogContent>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              toast.promise(
                deleteModel.mutateAsync(
                  {
                    modelId: model.id,
                  },
                  {
                    onSuccess,
                  },
                ),
                {
                  loading: "Deleting your model...",
                  success: "Your model has been deleted.",
                  error: "Something went wrong :(",
                },
              )
            }
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export const deviceModelColumns: ColumnDef<SelectDeviceModel>[] = [
  {
    accessorKey: "name",
    header: "Model Name",
    cell: ({ row }) => {
      return <Badge>{row.original.name}</Badge>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const [isOpen, setIsOpen] = useState(false);
      const utils = api.useUtils();
      return (
        <>
          <DeleteDialog
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            model={row.original}
            onSuccess={() => void utils.model.getAllDeviceModels.invalidate()}
          />
          <Actions elem={row.original}>
            <DropdownMenuItem onClick={() => setIsOpen(true)}>
              Delete
            </DropdownMenuItem>
          </Actions>
        </>
      );
    },
  },
];

export const systemModelColumns: ColumnDef<SelectSystemModel>[] = [
  {
    accessorKey: "name",
    header: "Model Name",
    cell: ({ row }) => {
      return <Badge>{row.original.name}</Badge>;
    },
  },
  {
    accessorKey: "parts",
    header: "Components",
    cell: ({ row }) => {
      return (
        <div className="flex flex-col gap-2">
          {row.original.parts.map((p) => (
            <div className="flex gap-2" key={p.name}>
              <Badge>{p.name}</Badge>
              <div className="font-medium">x{p.count}</div>
            </div>
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const [isOpen, setIsOpen] = useState(false);
      const utils = api.useUtils();
      return (
        <>
          <DeleteDialog
            isOpen={isOpen}
            setIsOpen={setIsOpen}
            model={row.original}
            onSuccess={() => void utils.model.getAllSystemModels.invalidate()}
          />
          <Actions elem={row.original}>
            <DropdownMenuItem onClick={() => setIsOpen(true)}>
              Delete
            </DropdownMenuItem>
          </Actions>
        </>
      );
    },
  },
];
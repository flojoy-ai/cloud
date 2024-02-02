"use client";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Badge } from "~/components/ui/badge";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { publicInsertSystemSchema } from "~/types/hardware";

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

import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { z } from "zod";
import { type SelectSystemModel } from "~/types/model";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const systemFormSchema = publicInsertSystemSchema.extend({
  deviceIds: z.object({ value: z.string() }).array(),
});

type FormSchema = z.infer<typeof systemFormSchema>;

type Props = {
  workspaceId: string;
  model?: SelectSystemModel;
  projectId?: string;
  systemModels?: SelectSystemModel[];
  children?: React.ReactNode;
};

const getSystemPartModels = (model: SelectSystemModel) =>
  model.parts.flatMap((m) => new Array<string>(m.count).fill(m.modelId));

const CreateSystem = ({
  children,
  workspaceId,
  model,
  systemModels,
  projectId,
}: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const utils = api.useUtils();
  const [deviceModels, setDeviceModels] = useState<string[] | undefined>(
    model ? getSystemPartModels(model) : undefined,
  );

  const createSystem = api.hardware.createSystem.useMutation({
    onSuccess: () => {
      void utils.hardware.getAllHardware.invalidate();

      setIsDialogOpen(false);
    },
  });

  const { data: devices } = api.hardware.getAllHardware.useQuery({
    workspaceId: workspaceId,
  });

  const { data: models } = api.model.getAllModels.useQuery({
    workspaceId: workspaceId,
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(systemFormSchema),
    defaultValues: {
      workspaceId: workspaceId,
      modelId: model?.id,
      projectId: projectId,
      deviceIds: [],
    },
  });

  useEffect(() => {
    if (isDialogOpen) {
      form.reset();
    }
  }, [isDialogOpen]);

  useEffect(() => {
    if (model !== undefined || form.watch("modelId") === undefined) {
      return;
    }

    if (systemModels === undefined) {
      throw new Error(
        "Must define system models to pick from if no model is passed",
      );
    }

    const m = systemModels.find((m) => m.id === form.watch("modelId"));
    if (m === undefined) {
      throw new Error("System model not found, this shouldn't happen");
    }

    const deviceModels = getSystemPartModels(m);

    form.setValue(
      "deviceIds",
      deviceModels.map((_) => ({
        value: "",
      })),
    );
    setDeviceModels(deviceModels);
  }, [form.watch("modelId")]);

  if (!devices || !models) {
    return (
      <Button variant="default" size="sm" disabled={true}>
        {children}
      </Button>
    );
  }

  function onSubmit(values: FormSchema) {
    const deviceIds = values.deviceIds.map((d) => d.value);
    toast.promise(
      createSystem.mutateAsync({
        ...values,
        deviceIds,
      }),
      {
        loading: "Creating your system instance...",
        success: "Your system is ready.",
        error: (err) => `${err}`,
      },
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register a new system</DialogTitle>
          <DialogDescription>
            Which hardware system of yours do you want to register?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>System Identifier</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. SN4321"
                      {...field}
                      data-1p-ignore
                    />
                  </FormControl>
                  <FormDescription>
                    How do you identity this system instance? This is usually a
                    serial number like SN4321.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {model === undefined && systemModels !== undefined && (
              <FormField
                control={form.control}
                name="modelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {systemModels.map((m) => (
                            <SelectItem value={m.id} key={m.id}>
                              {m.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Which model is this device?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {form.watch("modelId") && deviceModels !== undefined && (
              <div>
                <FormLabel>Parts</FormLabel>
                <FormDescription>
                  What are the device instances that make up this system?
                </FormDescription>
                <div>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex w-fit flex-col gap-y-6">
                      {deviceModels.sort().map((part) => (
                        <Badge>{models.find((m) => m.id === part)?.name}</Badge>
                      ))}
                    </div>
                    <div className="flex w-fit flex-col gap-y-1.5">
                      {deviceModels.sort().map((part, index) => (
                        <FormField
                          control={form.control}
                          key={`${part}-${index}`}
                          name={`deviceIds.${index}.value` as const}
                          render={({ field }) => (
                            <FormItem className="flex items-center gap-2">
                              <FormControl>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {devices
                                      .filter((d) => d.modelId === part)
                                      .map((device) => (
                                        <SelectItem
                                          value={device.id}
                                          key={device.id}
                                        >
                                          {device.name}
                                        </SelectItem>
                                      ))}
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter className="">
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
              <Button type="submit">Register</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateSystem;

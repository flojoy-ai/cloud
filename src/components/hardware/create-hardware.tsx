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
import { insertHardwareSchema } from "~/types/hardware";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Model } from "~/schemas/public/Model";
import { ModelTree } from "~/types/model";
import { Icons } from "../icons";

type FormSchema = z.infer<typeof insertHardwareSchema>;

type Props = {
  workspaceId: string;
  model?: Model;
  models?: Model[];
  projectId?: string;
  children?: React.ReactNode;
};

const getComponentModelIds = (tree: ModelTree) => {
  // TODO: Only get depth 1
  return tree.components.flatMap((m) =>
    new Array<string>(m.count).fill(m.model.id),
  );
};

const CreateHardware = ({
  children,
  workspaceId,
  model,
  models,
  projectId,
}: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const utils = api.useUtils();
  const [deviceModels, setDeviceModels] = useState<string[] | undefined>(
    undefined,
  );

  const createHardware = api.hardware.createHardware.useMutation({
    onSuccess: () => {
      void utils.hardware.getAllHardware.invalidate();

      setIsDialogOpen(false);
    },
  });

  const { data: hardware } = api.hardware.getAllHardware.useQuery({
    workspaceId: workspaceId,
    onlyAvailable: true,
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(insertHardwareSchema),
    defaultValues: {
      workspaceId: workspaceId,
      modelId: model?.id,
      projectId: projectId,
      components: [],
    },
  });

  const modelId = form.watch("modelId");

  // TODO: Server fetch this somehow?
  // Maybe attach the immediate children to each model only
  const { data: modelTree, isLoading: treeLoading } =
    api.model.getModelById.useQuery(
      {
        modelId: modelId,
      },
      { enabled: !!modelId },
    );

  useEffect(() => {
    if (modelId === undefined || modelTree === undefined) {
      return;
    }

    if (models === undefined) {
      throw new Error(
        "Must define system models to pick from if no model is passed",
      );
    }

    const deviceModels = getComponentModelIds(modelTree);

    form.setValue(
      "components",
      deviceModels.map((_) => ({
        hardwareId: "",
      })),
    );
    setDeviceModels(deviceModels);
  }, [modelId, form, modelTree, models]);

  if (!hardware || !models) {
    return (
      <Button variant="default" size="sm" disabled={true}>
        {children}
      </Button>
    );
  }

  function onSubmit(values: FormSchema) {
    toast.promise(createHardware.mutateAsync(values), {
      loading: "Creating your hardware instance...",
      success: "Your hardware is ready.",
      error: (err) => `${err}`,
    });
  }

  return (
    <Dialog
      open={isDialogOpen}
      onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) {
          form.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register new hardware</DialogTitle>
          <DialogDescription>
            Which hardware of yours do you want to register?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Identifier</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. SN4321"
                      {...field}
                      data-1p-ignore
                    />
                  </FormControl>
                  <FormDescription>
                    How do you identify this hardware instance? This is usually
                    a serial number like SN4321.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {model === undefined && models !== undefined && (
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
                          {models.map((m) => (
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

            {modelId && treeLoading ? (
              <Icons.spinner className="mx-auto animate-spin" />
            ) : (
              modelId &&
              deviceModels !== undefined &&
              deviceModels.length > 0 && (
                <div>
                  <FormLabel>Parts</FormLabel>
                  <FormDescription>
                    What are the device instances that make up this system?
                  </FormDescription>
                  <div>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex w-fit flex-col gap-y-6">
                        {deviceModels.sort().map((part, index) => (
                          <Badge key={index}>
                            {models.find((m) => m.id === part)?.name}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex w-fit flex-col gap-y-1.5">
                        {deviceModels.sort().map((part, index) => (
                          <FormField
                            control={form.control}
                            key={`${part}-${index}`}
                            name={`components.${index}.hardwareId` as const}
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
                                      {hardware
                                        .filter((hw) => hw.modelId === part)
                                        .map((hw) => (
                                          <SelectItem value={hw.id} key={hw.id}>
                                            {hw.name}
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
              )
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

export default CreateHardware;

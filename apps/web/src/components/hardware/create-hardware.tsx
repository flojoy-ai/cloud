import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { useForm } from "react-hook-form";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { client } from "@/lib/client";
import {
  getHardwaresQueryKey,
  getHardwaresQueryOpts,
  getModelHardwareQueryKey,
} from "@/lib/queries/hardware";
import { getModelQueryOpts, getModelsQueryOpts } from "@/lib/queries/model";
import { handleError } from "@/lib/utils";
import { Workspace } from "@cloud/server/src/schemas/public/Workspace";
import { insertHardware } from "@cloud/server/src/types/hardware";
import { ModelTreeRoot } from "@cloud/server/src/types/model";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { Static, Type as t } from "@sinclair/typebox";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Icons } from "../icons";

const formSchema = t.Composite([
  t.Omit(insertHardware, ["components"]),
  t.Object({
    components: t.Array(t.Object({ hardwareId: t.String() })),
  }),
]);

type FormSchema = Static<typeof formSchema>;

type Props = {
  workspace: Workspace;
  modelId: string;
  projectId?: string;
  children?: React.ReactNode;
};

const getComponentModelIds = (tree: ModelTreeRoot) => {
  // TODO: Only get depth 1
  return tree.components.flatMap((m) =>
    new Array<string>(m.count).fill(m.model.id),
  );
};

const CreateHardware = ({ children, workspace, modelId, projectId }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [deviceModels, setDeviceModels] = useState<string[] | undefined>(
    undefined,
  );
  const queryClient = useQueryClient();

  const createHardware = useMutation({
    mutationFn: async (values: Static<typeof insertHardware>) => {
      const { error } = await client.hardware.index.post(values, {
        headers: { "flojoy-workspace-id": workspace.id },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getHardwaresQueryKey() });
      queryClient.invalidateQueries({
        queryKey: getModelHardwareQueryKey(modelId),
      });
      setIsDialogOpen(false);
    },
  });

  const { data: hardware } = useSuspenseQuery(
    getHardwaresQueryOpts({ onlyAvailable: true, context: { workspace } }),
  );
  const { data: models } = useSuspenseQuery(
    getModelsQueryOpts({ context: { workspace } }),
  );
  const { data: modelTree, isPending: treeLoading } = useSuspenseQuery(
    getModelQueryOpts({ context: { workspace }, modelId }),
  );

  const form = useForm<FormSchema>({
    resolver: typeboxResolver(formSchema),
    defaultValues: {
      modelId,
      projectId,
      components: [],
    },
  });

  useEffect(() => {
    const deviceModels = getComponentModelIds(modelTree);

    form.setValue(
      "components",
      deviceModels.map(() => ({
        hardwareId: "",
      })),
    );
    setDeviceModels(deviceModels);
  }, [modelId, form, modelTree]);

  if (!hardware) {
    return (
      <Button variant="default" size="sm" disabled={true}>
        {children}
      </Button>
    );
  }

  function onSubmit(values: FormSchema) {
    toast.promise(
      createHardware.mutateAsync({
        ...values,
        components: values.components.map((c) => c.hardwareId),
      }),
      {
        loading: "Creating your hardware instance...",
        success: "Your hardware is ready.",
        error: handleError,
      },
    );
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

            {treeLoading ? (
              <Icons.spinner className="mx-auto animate-spin" />
            ) : (
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

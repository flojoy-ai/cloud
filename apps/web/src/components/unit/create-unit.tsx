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
  getUnitsQueryKey,
  getUnitsQueryOpts,
  getPartVariationUnitQueryKey,
} from "@/lib/queries/unit";
import {
  getPartVariationQueryOpts,
  getPartVariationsQueryOpts,
} from "@/lib/queries/part-variation";
import { handleError } from "@/lib/utils";
import { Workspace, PartVariationTreeRoot, insertUnit } from "@cloud/shared";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { Static, Type as t } from "@sinclair/typebox";
import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { Icons } from "../icons";
import { Combobox } from "../ui/combobox";

const formSchema = t.Composite([
  t.Omit(insertUnit, ["components"]),
  t.Object({
    components: t.Array(t.Object({ unitId: t.String() })),
  }),
]);

type FormSchema = Static<typeof formSchema>;

type Props = {
  workspace: Workspace;
  partVariationId: string;
  projectId?: string;
  children?: React.ReactNode;
};

const getComponentPartVariationIds = (tree: PartVariationTreeRoot) => {
  // TODO: Only get depth 1
  return tree.components.flatMap((m) =>
    new Array<string>(m.count).fill(m.partVariation.id),
  );
};

const CreateUnit = ({
  children,
  workspace,
  partVariationId,
  projectId,
}: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [devicePartVariations, setDevicePartVariations] = useState<
    string[] | undefined
  >(undefined);
  const queryClient = useQueryClient();

  const createUnit = useMutation({
    mutationFn: async (values: Static<typeof insertUnit>) => {
      const { error } = await client.unit.index.post(values, {
        headers: { "flojoy-workspace-id": workspace.id },
      });
      if (error) throw error.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getUnitsQueryKey() });
      queryClient.invalidateQueries({
        queryKey: getPartVariationUnitQueryKey(partVariationId),
      });
      setIsDialogOpen(false);
    },
  });

  const { data: units } = useSuspenseQuery(
    getUnitsQueryOpts({ onlyAvailable: true, context: { workspace } }),
  );
  const { data: partVariations } = useSuspenseQuery(
    getPartVariationsQueryOpts({ context: { workspace } }),
  );
  const { data: partVariationTree, isPending: treeLoading } = useSuspenseQuery(
    getPartVariationQueryOpts({ context: { workspace }, partVariationId }),
  );

  const form = useForm<FormSchema>({
    resolver: typeboxResolver(formSchema),
    defaultValues: {
      partVariationId,
      projectId,
      components: [],
    },
  });

  useEffect(() => {
    const devicePartVariations =
      getComponentPartVariationIds(partVariationTree);

    form.setValue(
      "components",
      devicePartVariations.map(() => ({
        unitId: "",
      })),
    );
    setDevicePartVariations(devicePartVariations);
  }, [partVariationId, form, partVariationTree]);

  if (!units) {
    return (
      <Button variant="default" size="sm" disabled={true}>
        {children}
      </Button>
    );
  }

  function onSubmit(values: FormSchema) {
    const devicePartVariations =
      getComponentPartVariationIds(partVariationTree);
    if (devicePartVariations.length > 0) {
      let hasError = false;
      for (let i = 0; i < values.components.length; i++) {
        if (values.components[i]?.unitId === "") {
          form.setError(`components.${i}.unitId` as const, {
            message: "Cannot have empty component",
          });
          hasError = true;
        }
      }
      if (hasError) {
        return;
      }
    }
    toast.promise(
      createUnit.mutateAsync({
        ...values,
        components: values.components.map((c) => c.unitId),
      }),
      {
        loading: "Creating your unit instance...",
        success: "Your unit is ready.",
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
          <DialogTitle>Register new unit</DialogTitle>
          <DialogDescription>
            Which unit of yours do you want to register?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="serialNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Serial Number</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. SN4321"
                      {...field}
                      data-1p-ignore
                    />
                  </FormControl>
                  <FormDescription>
                    A unique identifier for this unit instance.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {treeLoading ? (
              <Icons.spinner className="mx-auto animate-spin" />
            ) : (
              devicePartVariations !== undefined &&
              devicePartVariations.length > 0 && (
                <div>
                  <FormLabel>Parts</FormLabel>
                  <FormDescription>
                    What are the device instances that make up this system?
                  </FormDescription>
                  <div>
                    <div className="mt-4 flex items-center gap-2">
                      <div className="flex w-fit flex-col gap-y-6">
                        {devicePartVariations.sort().map((part, index) => (
                          <Badge key={index}>
                            {
                              partVariations.find((m) => m.id === part)
                                ?.partNumber
                            }
                          </Badge>
                        ))}
                      </div>
                      <div className="flex w-fit flex-col gap-y-1.5">
                        {devicePartVariations.sort().map((part, index) => (
                          <FormField
                            control={form.control}
                            key={`${part}-${index}`}
                            name={`components.${index}.unitId` as const}
                            render={({ field }) => (
                              <FormItem className="flex items-center gap-2">
                                <FormControl>
                                  <Combobox
                                    options={units.filter(
                                      (hw) => hw.partVariationId === part,
                                    )}
                                    value={field.value}
                                    setValue={(val) =>
                                      form.setValue(
                                        `components.${index}.unitId` as const,
                                        val ?? "",
                                      )
                                    }
                                    displaySelector={(val) => val.serialNumber}
                                    valueSelector={(val) => val.id}
                                    searchText="Search unit..."
                                  />
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

export default CreateUnit;

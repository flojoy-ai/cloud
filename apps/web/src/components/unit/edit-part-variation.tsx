import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/client";
import {
  getPartPartVariationsQueryKey,
  getPartVariationQueryKey,
  getPartVariationsQueryKey,
} from "@/lib/queries/part-variation";
import { handleError } from "@/lib/utils";
import {
  PartVariation,
  PartVariationTreeRoot,
  partVariationUpdate,
} from "@cloud/shared";
import { PartVariationMarket } from "@cloud/shared/src/schemas/public/PartVariationMarket";
import { PartVariationType } from "@cloud/shared/src/schemas/public/PartVariationType";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { Static, Type as t } from "@sinclair/typebox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Autocomplete } from "../ui/autocomplete";
import { Checkbox } from "../ui/checkbox";
import { Combobox } from "../ui/combobox";
import { useEffect } from "react";

const partVariationFormSchema = t.Composite([
  partVariationUpdate,
  t.Object({ hasComponents: t.Boolean() }),
]);

type FormSchema = Static<typeof partVariationFormSchema>;

const getDefaultValues = (pv: PartVariationTreeRoot) => {
  return {
    type: pv.type?.name,
    market: pv.market?.name,
    hasComponents: pv.components.length > 0,
    components: pv.components.map((c) => ({
      count: c.count,
      partVariationId: c.partVariation.id,
    })),
    description: pv.description ?? undefined,
  };
};

type Props = {
  workspaceId: string;
  partVariations: PartVariation[];
  existing: PartVariationTreeRoot;
  hasExistingUnits: boolean;
  open: boolean;
  setOpen: (open: boolean) => void;
  partVariationTypes: PartVariationType[];
  partVariationMarkets: PartVariationMarket[];
};

const EditPartVariation = ({
  workspaceId,
  existing,
  hasExistingUnits,
  partVariations,
  open,
  setOpen,
  partVariationTypes,
  partVariationMarkets,
}: Props) => {
  const queryClient = useQueryClient();

  const editPartVariation = useMutation({
    mutationFn: async (values: Static<typeof partVariationUpdate>) => {
      const { error } = await client
        .partVariation({ partVariationId: existing.id })
        .index.patch(values, {
          headers: { "flojoy-workspace-id": workspaceId },
        });
      if (error) throw error.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getPartVariationsQueryKey() });
      queryClient.invalidateQueries({
        queryKey: getPartVariationQueryKey(existing.id),
      });
      queryClient.invalidateQueries({
        queryKey: getPartPartVariationsQueryKey(existing.partId),
      });

      setOpen(false);
    },
  });

  const form = useForm<FormSchema>({
    resolver: typeboxResolver(partVariationFormSchema),
    defaultValues: getDefaultValues(existing),
  });

  const { fields, insert, remove } = useFieldArray({
    control: form.control,
    name: "components",
    keyName: "partVariationId",
  });

  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(existing));
    } else {
      // This is required because react hook form is stupid
      form.reset({ ...getDefaultValues(existing), components: [] });
    }
  }, [open, form, existing]);

  function onSubmit(values: FormSchema) {
    const { hasComponents, ...rest } = values;

    if (!hasComponents) {
      toast.promise(
        editPartVariation.mutateAsync({
          ...rest,
          components: [],
        }),
        {
          loading: "Updating your part variation...",
          success: "Part variation updated.",
          error: handleError,
        },
      );
    } else {
      let hasError = false;
      for (let i = 0; i < values.components.length; i++) {
        if (values.components[i]?.partVariationId === "") {
          form.setError(`components.${i}.partVariationId` as const, {
            message: "Cannot have empty component part",
          });
          hasError = true;
        }
      }
      if (hasError) {
        return;
      }

      toast.promise(editPartVariation.mutateAsync(rest), {
        loading: "Updating your part variation...",
        success: "Part variation updated.",
        error: handleError,
      });
    }
  }

  const allowedPartVariations = partVariations.filter(
    (pv) => pv.id !== existing.id,
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>Editing {existing.partNumber}</DialogTitle>
          <DialogDescription>
            Make changes to this part variation. Note: you can only modify
            components of part variations with no existing units.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (e) => {
              console.error(e);
              console.error(form.getValues());
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input {...field} data-1p-ignore />
                  </FormControl>
                  <FormDescription>
                    (Optional) A human readable description of what the part is.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <FormControl>
                    <Autocomplete
                      options={partVariationTypes.map((p) => p.name)}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(val) => form.setValue("type", val)}
                      placeholder="Search or create new..."
                      data-1p-ignore
                    />
                  </FormControl>
                  <FormDescription>
                    (Optional) What type of part is this? (e.g. PCB)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="market"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Market</FormLabel>
                  <FormControl>
                    <Autocomplete
                      options={partVariationMarkets.map((p) => p.name)}
                      {...field}
                      value={field.value ?? ""}
                      onChange={(val) => form.setValue("market", val)}
                      placeholder="Search or create new..."
                      data-1p-ignore
                    />
                  </FormControl>
                  <FormDescription>
                    (Optional) The targeting market of this part. (e.g. Medical)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {hasExistingUnits ? (
              <FormDescription>
                You cannot modify components of a part variation that has
                existing units. Please create a new one instead if you would
                like do so.
              </FormDescription>
            ) : (
              <>
                <FormField
                  control={form.control}
                  name="hasComponents"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-x-2">
                        <FormLabel>Has components?</FormLabel>
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={(state) =>
                              form.setValue(
                                "hasComponents",
                                Boolean(state.valueOf()),
                              )
                            }
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {form.watch("hasComponents") && (
                  <div className="space-y-2">
                    <FormLabel className="">Components</FormLabel>
                    <FormDescription>
                      You can pick the components that make up this assembly
                      from existing parts. This will help you build the
                      &apos;blueprint&apos; of the system.
                    </FormDescription>
                    {fields.map((field, index) => (
                      <div className="flex gap-2 " key={field.partVariationId}>
                        <FormField
                          control={form.control}
                          name={`components.${index}.partVariationId` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Combobox
                                  options={allowedPartVariations}
                                  value={field.value}
                                  setValue={(val) =>
                                    form.setValue(
                                      `components.${index}.partVariationId` as const,
                                      val ?? "",
                                    )
                                  }
                                  displaySelector={(val) => val.partNumber}
                                  valueSelector={(val) => val.id}
                                  descriptionSelector={(val) =>
                                    val.description ?? ""
                                  }
                                  searchText="Search part variation..."
                                  avoidCollisions={true}
                                  side="top"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          key={field.partVariationId}
                          name={`components.${index}.count` as const}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  type="number"
                                  min={1}
                                  className="w-20"
                                  {...form.register(
                                    `components.${index}.count` as const,
                                    {
                                      valueAsNumber: true,
                                    },
                                  )}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          onClick={() => remove(index)}
                          size="icon"
                          variant="ghost"
                        >
                          <Trash2
                            size={20}
                            className="stroke-muted-foreground"
                          />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      onClick={() =>
                        insert(fields.length, { partVariationId: "", count: 1 })
                      }
                      variant="secondary"
                      size="sm"
                    >
                      <Plus size={16} className="mr-2" /> Add Component
                    </Button>
                    <FormDescription>
                      When you try to initialize an unit based on this part
                      variation, then you first need to make sure all its
                      components exist.
                    </FormDescription>
                  </div>
                )}
              </>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Close
                </Button>
              </DialogClose>
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default EditPartVariation;

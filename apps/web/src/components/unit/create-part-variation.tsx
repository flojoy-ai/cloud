import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { client } from "@/lib/client";
import {
  getPartPartVariationsQueryKey,
  getPartVariationsQueryKey,
} from "@/lib/queries/part-variation";
import { handleError } from "@/lib/utils";
import { Part, PartVariation, insertPartVariation } from "@cloud/shared";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { Static, Type as t } from "@sinclair/typebox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Cpu, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Checkbox } from "../ui/checkbox";

const partVariationFormSchema = t.Composite([
  insertPartVariation,
  t.Object({ hasComponents: t.Boolean() }),
]);

type FormSchema = Static<typeof partVariationFormSchema>;

export type CreatePartVariationDefaultValues = Omit<
  FormSchema,
  "workspaceId" | "partId"
>;

type Props = {
  workspaceId: string;
  partVariations: PartVariation[];
  part: Part;
  defaultValues?: CreatePartVariationDefaultValues;
  setDefaultValues: (
    values: CreatePartVariationDefaultValues | undefined,
  ) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  openDialog: () => void;
};

const CreatePartVariation = ({
  workspaceId,
  partVariations,
  part,
  open,
  setOpen,
  openDialog,
  defaultValues,
  setDefaultValues,
}: Props) => {
  const queryClient = useQueryClient();

  const createPartVariation = useMutation({
    mutationFn: async (values: Static<typeof insertPartVariation>) => {
      const { error } = await client.partVariation.index.post(values, {
        headers: { "flojoy-workspace-id": workspaceId },
      });
      if (error) throw error;
    },
    onSuccess: (_, { partId }) => {
      queryClient.invalidateQueries({ queryKey: getPartVariationsQueryKey() });
      queryClient.invalidateQueries({
        queryKey: getPartPartVariationsQueryKey(partId),
      });

      setOpen(false);
    },
  });

  const getDefaultValues = useCallback(
    (defaultValues?: CreatePartVariationDefaultValues) => {
      return {
        workspaceId,
        partId: part.id,
        ...(defaultValues ?? {
          hasComponents: false,
          components: [{ partVariationId: "", count: 1 }],
        }),
      };
    },
    [part.id, workspaceId],
  );

  const form = useForm<FormSchema>({
    resolver: typeboxResolver(partVariationFormSchema),
    defaultValues: getDefaultValues(defaultValues),
  });

  const { fields, insert, remove } = useFieldArray({
    control: form.control,
    name: "components",
    keyName: "partVariationId",
  });

  // extremely annoying react hook form quirk with resetting field arrays
  useEffect(() => {
    if (open) {
      form.reset(getDefaultValues(defaultValues));
    } else {
      form.reset(getDefaultValues(undefined));
      setDefaultValues(undefined);
    }
  }, [
    open,
    defaultValues,
    form,
    part,
    workspaceId,
    getDefaultValues,
    setDefaultValues,
  ]);

  const handleRemove = (i: number) => {
    if (fields.length === 1) {
      return;
    }
    remove(i);
  };

  function onSubmit(values: FormSchema) {
    const { hasComponents, ...rest } = values;
    if (!hasComponents) {
      toast.promise(
        createPartVariation.mutateAsync({
          ...rest,
          components: [],
        }),
        {
          loading: "Creating your part variation...",
          success: "Part variation created.",
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

      toast.promise(createPartVariation.mutateAsync(rest), {
        loading: "Creating your part variation...",
        success: "Part variation created.",
        error: handleError,
      });
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (open) {
          form.reset(defaultValues);
        }
      }}
    >
      <DialogTrigger asChild onClick={() => openDialog()}>
        <Button variant="default" size="sm">
          <Cpu className="mr-2 text-muted" size={20} />
          Create
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-screen overflow-auto">
        <DialogHeader>
          <DialogTitle>Register a new part variation</DialogTitle>
          <DialogDescription>
            What variant of this part are you testing?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (e) => {
              console.log(e);
              console.log(form.getValues());
            })}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="partNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Part Number</FormLabel>
                  <FormControl>
                    <Input placeholder="M1234" {...field} data-1p-ignore />
                  </FormControl>
                  <FormDescription>
                    An identifier for this part variation. This will always be
                    prefixed with the part's name.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                  You can pick the components that make up this assembly from
                  existing parts. This will help you build the
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
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {partVariations.map((partVariation) => (
                                  <SelectItem
                                    value={partVariation.id}
                                    key={partVariation.id}
                                  >
                                    {partVariation.partNumber}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
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
                      onClick={() => handleRemove(index)}
                      size="icon"
                      variant="ghost"
                    >
                      <Trash2 size={20} className="stroke-muted-foreground" />
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
                  variation, then you first need to make sure all its components
                  exist.
                </FormDescription>
              </div>
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

export default CreatePartVariation;

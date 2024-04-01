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
import { getPartVariationsQueryKey } from "@/lib/queries/part-variation";
import { handleError } from "@/lib/utils";
import { Part, PartVariation, insertPartVariation } from "@cloud/shared";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { Static, Type as t } from "@sinclair/typebox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Cpu, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

const partVariationFormSchema = t.Composite([
  insertPartVariation,
  t.Object({ type: t.Union([t.Literal("device"), t.Literal("system")]) }),
]);
type FormSchema = Static<typeof partVariationFormSchema>;

type Props = {
  workspaceId: string;
  partVariations: PartVariation[];
  part: Part;
};

const CreatePartVariation = ({ workspaceId, partVariations, part }: Props) => {
  const queryClient = useQueryClient();

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const createPartVariation = useMutation({
    mutationFn: async (values: Static<typeof insertPartVariation>) => {
      const { error } = await client.partVariation.index.post(values, {
        headers: { "flojoy-workspace-id": workspaceId },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getPartVariationsQueryKey() });

      setIsDialogOpen(false);
    },
  });

  const form = useForm<FormSchema>({
    resolver: typeboxResolver(partVariationFormSchema),
    defaultValues: {
      workspaceId,
      partId: part.id,
      type: "device",
      components: [{ partVariationId: "", count: 1 }],
    },
  });
  const { fields, insert, remove } = useFieldArray({
    control: form.control,
    name: "components",
    keyName: "partVariationId",
  });

  const handleRemove = (index: number) => {
    if (fields.length === 1) {
      return;
    }
    remove(index);
  };

  function onSubmit(values: FormSchema) {
    const { type, ...rest } = values;
    if (type === "device") {
      toast.promise(
        createPartVariation.mutateAsync({
          ...rest,
          components: [],
        }),
        {
          loading: "Creating your partVariation...",
          success: "PartVariation created.",
          error: handleError,
        },
      );
    }

    if (type === "system") {
      let hasError = false;
      for (let i = 0; i < values.components.length; i++) {
        if (values.components[i]?.partVariationId === "") {
          form.setError(`components.${i}.partVariationId` as const, {
            message: "Cannot have empty component partVariation",
          });
          hasError = true;
        }
      }
      if (hasError) {
        return;
      }

      toast.promise(createPartVariation.mutateAsync(rest), {
        loading: "Creating your partVariation...",
        success: "PartVariation created.",
        error: handleError,
      });
    }
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
          <Cpu className="mr-2 text-muted" size={20} />
          Create
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register a new hardware partVariation</DialogTitle>
          <DialogDescription>
            What is the hardware partVariation you are working with?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (e) => console.log(e))}
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
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hardware PartVariation Type</FormLabel>
                  <FormControl>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="device">Device</SelectItem>
                        <SelectItem value="system">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormDescription>
                    A <b>device</b> is a standalone hardware device made up of
                    just itself. A <b>system</b> is a set of interconnected{" "}
                    <b>devices</b> together.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("type") === "system" && (
              <div className="space-y-2">
                <FormLabel className="">System Components</FormLabel>
                <FormDescription>
                  You can pick the components that make up this system from
                  existing device partVariations. This will help you build the
                  &apos;blueprint&apos; of the system.
                </FormDescription>
                {fields.map((field, index) => (
                  <div className="flex gap-2 " key={field.partVariationId}>
                    <FormField
                      control={form.control}
                      key={field.partVariationId}
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
                  When you try to initialize an system instance based on this
                  partVariation, then you first need to make sure all its
                  components exist.
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

"use client";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
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
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
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
import { insertModelSchema } from "~/types/model";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Cpu, Plus, Trash2 } from "lucide-react";
import { Model } from "~/schemas/public/Model";

const modelFormSchema = insertModelSchema.extend({
  type: z.enum(["device", "system"]),
});

type FormSchema = z.infer<typeof modelFormSchema>;

type Props = {
  workspaceId: string;
  models: Model[];
};

const CreateModel = ({ workspaceId, models }: Props) => {
  const router = useRouter();
  const utils = api.useUtils();

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const createModel = api.model.createModel.useMutation({
    onSuccess: () => {
      router.refresh();
      utils.model.getAllModels.invalidate();

      setIsDialogOpen(false);
    },
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: {
      workspaceId,
      type: "device",
      components: [{ modelId: "", count: 1 }],
    },
  });
  const { fields, insert, remove } = useFieldArray({
    control: form.control,
    name: "components",
    keyName: "modelId",
  });

  const handleRemove = (index: number) => {
    if (fields.length === 1) {
      return;
    }
    remove(index);
  };

  function onSubmit(values: FormSchema) {
    if (values.type === "device") {
      toast.promise(
        createModel.mutateAsync({
          ...values,
          components: [],
        }),
        {
          loading: "Creating your model...",
          success: "Model created.",
          error: "Something went wrong :(",
        },
      );
    }

    if (values.type === "system") {
      let hasError = false;
      for (let i = 0; i < values.components.length; i++) {
        if (values.components[i]?.modelId === "") {
          form.setError(`components.${i}.modelId` as const, {
            message: "Cannot have empty component model",
          });
          hasError = true;
        }
      }
      if (hasError) {
        return;
      }

      toast.promise(createModel.mutateAsync(values), {
        loading: "Creating your model...",
        success: "Model created.",
        error: "Something went wrong :(",
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
          <DialogTitle>Register a new hardware model</DialogTitle>
          <DialogDescription>
            What is the hardware model you are working with?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, (e) => console.log(e))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hardware Model Name</FormLabel>
                  <FormControl>
                    <Input placeholder="M1234" {...field} data-1p-ignore />
                  </FormControl>
                  <FormDescription></FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hardware Model Type</FormLabel>
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
                  existing device models. This will help you build the
                  &apos;blueprint&apos; of the system.
                </FormDescription>
                {fields.map((field, index) => (
                  <div className="flex gap-2 " key={field.modelId}>
                    <FormField
                      control={form.control}
                      key={field.modelId}
                      name={`components.${index}.modelId` as const}
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
                                {models.map((model) => (
                                  <SelectItem value={model.id} key={model.id}>
                                    {model.name}
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
                      key={field.modelId}
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
                    insert(fields.length, { modelId: "", count: 1 })
                  }
                  variant="secondary"
                  size="sm"
                >
                  <Plus size={16} className="mr-2" /> Add Component
                </Button>
                <FormDescription>
                  When you try to initialize an system instance based on this
                  model, then you first need to make sure all its components
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

export default CreateModel;

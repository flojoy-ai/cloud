"use client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
import { publicInsertModelSchema, type SelectModel } from "~/types/model";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Cpu, Plus, Trash2 } from "lucide-react";

const modelFormSchema = publicInsertModelSchema.extend({
  parts: z.object({ value: z.string() }).array(),
});

type FormSchema = z.infer<typeof modelFormSchema>;

type Props = {
  workspaceId: string;
  deviceModels: SelectModel[];
};

const CreateModel = ({ workspaceId, deviceModels }: Props) => {
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const createModel = api.model.createModel.useMutation({
    onSuccess: () => {
      router.refresh();
      setIsDialogOpen(false);
    },
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: {
      workspaceId,
      type: "device",
      parts: [{ value: "" }],
    },
  });
  const { fields, insert, remove } = useFieldArray({
    control: form.control,
    name: "parts",
    keyName: "id",
  });

  const handleRemove = (index: number) => {
    if (fields.length === 1) {
      return;
    }
    remove(index);
  };

  useEffect(() => {
    form.reset();
  }, [isDialogOpen]);

  function onSubmit(values: FormSchema) {
    toast.promise(
      createModel.mutateAsync({
        ...values,
        parts:
          values.type === "system" ? values.parts?.map((p) => p.value) : null,
      }),
      {
        loading: "Creating your model...",
        success: "Model created.",
        error: "Something went wrong :(",
      },
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          <Cpu className="mr-2 text-muted" size={20} />
          Create Model
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register a new hardware model</DialogTitle>
          <DialogDescription>
            Which hardware device of yours do you want to register?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="New Board Type"
                      {...field}
                      data-1p-ignore
                    />
                  </FormControl>
                  <FormDescription>
                    What is the name of your hardware model?
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
                    A <b>device</b> is a standalone hardware device.
                    <br />A <b>system</b> is a hardware device composed of other
                    hardware devices.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {form.watch("type") === "system" && (
              <>
                {fields.map((field, index) => (
                  <div className="flex" key={field.id}>
                    <FormField
                      control={form.control}
                      key={field.id}
                      name={`parts.${index}.value` as const}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Part {index + 1}</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger className="w-[180px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {deviceModels.map((model) => (
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
                    <Button
                      type="button"
                      onClick={() => insert(index + 1, { value: "" })}
                      className="mt-auto"
                      variant="ghost"
                    >
                      <Plus />
                    </Button>
                    <Button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="mt-auto"
                      variant="ghost"
                    >
                      <Trash2 />
                    </Button>
                  </div>
                ))}
              </>
            )}
            <DialogFooter className="">
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

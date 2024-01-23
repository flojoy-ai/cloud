"use client";
import { type SelectProject } from "~/types/project";

import { toast } from "sonner";
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
import { Label } from "~/components/ui/label";
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
  project: SelectProject & { model: SelectSystemModel };
};

const CreateSystem = ({ project }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const utils = api.useUtils();

  const createSystem = api.hardware.createSystem.useMutation({
    onSuccess: () => {
      void utils.hardware.getAllHardware.invalidate();

      setIsDialogOpen(false);
    },
  });

  const { data: devices } = api.hardware.getAllHardware.useQuery({
    workspaceId: project.workspaceId,
    type: "device",
  });

  const deviceModels = project.model.parts.flatMap((m) =>
    new Array<string>(m.count).fill(m.modelId),
  );

  const form = useForm<FormSchema>({
    resolver: zodResolver(systemFormSchema),
    defaultValues: {
      workspaceId: project.workspaceId,
      modelId: project.modelId,
      projectId: project.id,
      deviceIds: deviceModels.map((_) => ({ value: "" })),
    },
  });

  if (!devices) {
    return null;
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
        error: "Something went wrong :(",
      },
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Register System
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
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Circuit Board #1"
                      {...field}
                      data-1p-ignore
                    />
                  </FormControl>
                  <FormDescription>
                    What is the name of your system?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Label>Parts</Label>
            {deviceModels.map((part, index) => (
              <FormField
                control={form.control}
                key={`${part}-${index}`}
                name={`deviceIds.${index}.value` as const}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{part}</FormLabel>
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
                              <SelectItem value={device.id} key={device.id}>
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

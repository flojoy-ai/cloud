"use client";
import { type SelectProject } from "~/types/project";

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
import { type SelectModel } from "~/types/model";
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
  project: SelectProject & { model: SelectModel };
};

const CreateSystem = ({ project }: Props) => {
  const router = useRouter();

  if (project.model.type !== "system") {
    throw new Error(
      "This component cannot be used in a project whose model is not a system",
    );
  }

  if (project.model.parts === null) {
    throw new Error("System parts is null, this shouldn't happen");
  }

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const createSystem = api.hardware.createSystem.useMutation({
    onSuccess: () => {
      router.refresh();
      setIsDialogOpen(false);
    },
  });

  const { data: devices } = api.hardware.getAllHardware.useQuery({
    workspaceId: project.workspaceId,
    type: "device",
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(systemFormSchema),
    defaultValues: {
      workspaceId: project.workspaceId,
      modelId: project.modelId,
      deviceIds: project.model.parts.map((part) => ({
        value: part,
      })),
    },
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: "deviceIds",
    keyName: "id",
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
        loading: "Creating your sysstem...",
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
            {project.model.parts.map((part, index) => (
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

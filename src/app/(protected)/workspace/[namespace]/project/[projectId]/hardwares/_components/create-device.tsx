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
import { type z } from "zod";
import { publicInsertDeviceSchema } from "~/types/hardware";

type FormSchema = z.infer<typeof publicInsertDeviceSchema>;

type Props = {
  project: SelectProject;
};

const CreateDevice = ({ project }: Props) => {
  const utils = api.useUtils();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const createHardware = api.hardware.createDevice.useMutation({
    onSuccess: () => {
      void utils.hardware.getAllHardware.invalidate();
      setIsDialogOpen(false);
    },
  });

  const form = useForm<FormSchema>({
    resolver: zodResolver(publicInsertDeviceSchema),
    defaultValues: {
      workspaceId: project.workspaceId,
      modelId: project.modelId,
      projectId: project.id,
    },
  });

  function onSubmit(values: FormSchema) {
    toast.promise(
      createHardware.mutateAsync({
        ...values,
      }),
      {
        loading: "Creating your device instance...",
        success: "Your device instance is ready.",
        error: "Something went wrong :(",
      },
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="default" size="sm">
          Register Device Instance
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Register a new device</DialogTitle>
          <DialogDescription>
            Which device instance of yours do you want to register?
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Identifier</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. SN1234"
                      {...field}
                      data-1p-ignore
                    />
                  </FormControl>
                  <FormDescription>
                    How do you identity this device instance? This is usually a
                    serial number like SN1234.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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

export default CreateDevice;

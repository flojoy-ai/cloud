"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

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
import { Button } from "~/components/ui/button";
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
import { insertWorkspaceSchema } from "~/types/workspace";
import { type z } from "zod";

export default function NewWorkspace() {
  const router = useRouter();

  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const createWorkspace = api.workspace.createWorkspace.useMutation({
    onSuccess: () => {
      router.refresh();
      setIsDialogOpen(false);
    },
  });

  const form = useForm<z.infer<typeof insertWorkspaceSchema>>({
    resolver: zodResolver(insertWorkspaceSchema),
    defaultValues: {},
  });

  function onSubmit(values: z.infer<typeof insertWorkspaceSchema>) {
    toast.promise(
      createWorkspace.mutateAsync({
        ...values,
      }),
      {
        loading: "Creating your workspace...",
        success: "Your workspace is ready.",
        error: "Something went wrong :(",
      },
    );
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => setIsDialogOpen(open)}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          New Workspace
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create your new workspace</DialogTitle>
          <DialogDescription>
            Your workspace is the home for all your projects.
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
                      placeholder="My Organization Name"
                      {...field}
                      data-1p-ignore
                    />
                  </FormControl>
                  <FormDescription>
                    How do you want to call your workspace?
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
              <Button type="submit">Create</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

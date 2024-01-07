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
import { useForm } from "react-hook-form";
import { insertProjectSchema } from "~/types/project";

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
import { type SelectWorkspace } from "~/types/workspace";
import { type z } from "zod";

type Props = {
  workspace: SelectWorkspace;
};

export default function NewProjectButton({ workspace }: Props) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const createProject = api.project.createProject.useMutation({
    onSuccess: () => {
      router.refresh();
      setIsDialogOpen(false);
    },
  });

  const form = useForm<z.infer<typeof insertProjectSchema>>({
    resolver: zodResolver(insertProjectSchema),
    defaultValues: {
      workspaceId: workspace.id,
    },
  });

  function onSubmit(values: z.infer<typeof insertProjectSchema>) {
    toast.promise(
      createProject.mutateAsync({
        ...values,
      }),
      {
        loading: "Creating your project...",
        success: "Your project is ready.",
        error: "Something went wrong :(",
      },
    );
  }

  return (
    <>
      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => setIsDialogOpen(open)}
      >
        <DialogTrigger asChild>
          <Button variant="default" size="sm">
            New Project
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create your new project</DialogTitle>
            <DialogDescription>
              Your project is the home for all your tests.
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
                        placeholder="My Circuit Testing Project"
                        {...field}
                        data-1p-ignore
                      />
                    </FormControl>
                    <FormDescription>
                      How do you want to call your project?
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
    </>
  );
}
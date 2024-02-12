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
import { type z } from "zod";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "~/components/ui/select";
import Link from "next/link";
import { Badge } from "~/components/ui/badge";
import { handleTrpcError } from "~/lib/utils";
import { Workspace } from "~/schemas/public/Workspace";
import { Model } from "~/schemas/public/Model";

type Props = {
  workspace: Workspace;
  models: Model[];
};

export default function NewProjectButton({ workspace, models }: Props) {
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
        error: handleTrpcError,
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
              A project is a collection of hardware instances that share the
              same hardware model and a common set of tests.
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
              <FormField
                control={form.control}
                name="modelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      {models.length > 0 ? (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {models.map((model) => (
                              <SelectItem value={model.id} key={model.id}>
                                {model.name}
                                {/* TODO: display model type */}
                                {/* <Badge className="ml-2" variant="outline"> */}
                                {/*   {model.type} */}
                                {/* </Badge> */}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm">
                          No models found, go{" "}
                          <Link
                            href={`/workspace/${workspace.namespace}/device`}
                            className="underline"
                          >
                            register one!
                          </Link>
                        </div>
                      )}
                    </FormControl>
                    <FormDescription>
                      Which hardware model is this project testing? <br />{" "}
                      Don&apos;t have a hardware model yet?{" "}
                      <Link
                        href="/workspace"
                        className="underline hover:text-primary"
                      >
                        Register one here.
                      </Link>
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

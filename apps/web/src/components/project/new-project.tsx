import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

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
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { handleError } from "@/lib/utils";

import { Workspace } from "@cloud/server/src/schemas/public/Workspace";
import { Model } from "@cloud/server/src/schemas/public/Model";
import { CreateProjectSchema } from "@cloud/server/src/types/project";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { Link, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/client";

type Props = {
  workspace: Workspace;
  models: Model[];
};

export default function NewProjectButton({ workspace, models }: Props) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const createProject = useMutation({
    mutationFn: async (values: CreateProjectSchema) => {
      const { data, error } = await client.project.index.post(values, {
        headers: { "flojoy-workspace-id": workspace.id },
      });
      if (error) {
        switch (error.status) {
          case 500:
            throw error.value;
          default:
            throw error.value;
        }
      }
      return data;
    },
    onSuccess: (data) => {
      router.navigate({
        to: "/workspace/$namespace/project/$projectId",
        params: { namespace: workspace.namespace, projectId: data.id },
      });
    },
  });

  const form = useForm<CreateProjectSchema>({
    resolver: typeboxResolver(CreateProjectSchema),
    defaultValues: {
      workspaceId: workspace.id,
    },
  });

  function onSubmit(values: CreateProjectSchema) {
    toast.promise(
      createProject.mutateAsync({
        ...values,
      }),
      {
        loading: "Creating your project...",
        success: "Your project is ready.",
        error: handleError,
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
            New Production Line
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create your new production line</DialogTitle>
            <DialogDescription>
              A production line groups a set of test stations that run tests on
              a specific hardware model.
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
                        placeholder="iPhone 13 mini"
                        {...field}
                        data-1p-ignore
                      />
                    </FormControl>
                    <FormDescription>
                      How do you want to call your production line?
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
                            to={"/workspace/$namespace/hardware"}
                            params={{ namespace: workspace.namespace }}
                            className="underline"
                          >
                            register one!
                          </Link>
                        </div>
                      )}
                    </FormControl>
                    <FormDescription>
                      Which hardware model is this production line testing?{" "}
                      <br /> Don&apos;t have a hardware model yet?{" "}
                      <Link
                        to="/workspace"
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

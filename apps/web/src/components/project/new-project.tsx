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

import { Workspace, CreateProjectSchema, PartVariation } from "@cloud/shared";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { Link, useRouter } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { client } from "@/lib/client";

type Props = {
  workspace: Workspace;
  partVariations: PartVariation[];
};

export default function NewProjectButton({ workspace, partVariations }: Props) {
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
            New Test Profile
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create your new test profile</DialogTitle>
            <DialogDescription>
              A test profile groups a set of test stations that run tests on a
              specific part variation.
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
                      What do you want to call your test profile?
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="partVariationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PartVariation</FormLabel>
                    <FormControl>
                      {partVariations.length > 0 ? (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {partVariations.map((partVariation) => (
                              <SelectItem
                                value={partVariation.id}
                                key={partVariation.id}
                              >
                                {partVariation.partNumber}
                                {/* TODO: display partVariation type */}
                                {/* <Badge className="ml-2" variant="outline"> */}
                                {/*   {partVariation.type} */}
                                {/* </Badge> */}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-sm">
                          No part variations found, go{" "}
                          <Link
                            to={"/workspace/$namespace/part"}
                            params={{ namespace: workspace.namespace }}
                            className="underline"
                          >
                            register one!
                          </Link>
                        </div>
                      )}
                    </FormControl>
                    <FormDescription>
                      Which part variation is this test profile testing? <br />{" "}
                      Don&apos;t see your part variation?{" "}
                      <Link
                        to="/workspace"
                        className="underline hover:text-primary"
                      >
                        Register it here.
                      </Link>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="py-1" />
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

"use client";

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
import { Input } from "~/components/ui/input";

import { publicUpdateWorkspaceSchema } from "~/types/workspace";
import { type z } from "zod";
import DeleteWorkspace from "./delete-workspace";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Icons } from "~/components/icons";
import { useWorkspace } from "../../../workspace-provider";

type Props = {
  workspaceId: string;
};

const GeneralForm = ({ workspaceId }: Props) => {
  const { data: workspace } = api.workspace.getWorkspaceById.useQuery({
    workspaceId,
  });

  const router = useRouter();
  const namespace = useWorkspace();

  const defaultValues = {
    workspaceId,
    name: "",
    namespace,
  };

  const form = useForm<z.infer<typeof publicUpdateWorkspaceSchema>>({
    resolver: zodResolver(publicUpdateWorkspaceSchema),
    defaultValues,
  });

  const updateWorkspace = api.workspace.updateWorkspace.useMutation({
    onSuccess: (data) => {
      form.reset(defaultValues);
      router.push(`/workspace/${data.namespace}/settings/general`);
      router.refresh();
    },
  });

  function onSubmit(values: z.infer<typeof publicUpdateWorkspaceSchema>) {
    toast.promise(
      updateWorkspace.mutateAsync({
        ...values,
      }),
      {
        loading: "Updating your workspace...",
        success: "Your workspace is updated.",
        error: "Something went wrong :(",
      },
    );
  }

  if (!workspace) {
    return <Icons.spinner />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} data-1p-ignore />
              </FormControl>
              <FormDescription>Give your workspace a new name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="namespace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Namespace</FormLabel>
              <FormControl>
                <Input {...field} data-1p-ignore />
              </FormControl>
              <FormDescription>
                Give your workspace a new namespace.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="py-4" />

        <div className="flex gap-2">
          <Button type="submit" size="sm">
            Update Workspace
          </Button>
          <DeleteWorkspace workspaceId={workspaceId} />
        </div>
      </form>
    </Form>
  );
};

export default GeneralForm;

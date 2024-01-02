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

type Props = {
  workspaceId: string;
};

const GeneralForm = ({ workspaceId }: Props) => {
  const { data: workspace } = api.workspace.getWorkspaceById.useQuery({
    workspaceId,
  });

  const router = useRouter();

  const defaultValues = {
    id: workspaceId,
    name: "",
  };

  const form = useForm<z.infer<typeof publicUpdateWorkspaceSchema>>({
    resolver: zodResolver(publicUpdateWorkspaceSchema),
    defaultValues,
  });

  const updateWorkspace = api.workspace.updateWorkspace.useMutation({
    onSuccess: () => {
      form.reset(defaultValues);
      router.refresh();
    },
  });

  function onSubmit(values: z.infer<typeof publicUpdateWorkspaceSchema>) {
    console.log(values);
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
    return null;
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

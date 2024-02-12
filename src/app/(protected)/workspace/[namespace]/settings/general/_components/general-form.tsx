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

import { type z } from "zod";
import DeleteWorkspace from "./delete-workspace";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWorkspace } from "../../../workspace-provider";
import { env } from "~/env";
import { handleTrpcError } from "~/lib/utils";
import { updateWorkspace } from "~/types/workspace";
import { workspace } from "~/schemas/public/Workspace";

type Props = {
  workspace: z.infer<typeof workspace>;
};

const formSchema = updateWorkspace
  .required()
  .refine((data) => data.name, {
    message: "Name is required",
    path: ["name"],
  })
  .refine((data) => data.namespace, {
    message: "Namespace is required",
    path: ["namespace"],
  });

const GeneralForm = ({ workspace }: Props) => {
  const router = useRouter();
  const namespace = useWorkspace();

  const defaultValues = {
    workspaceId: workspace.id,
    name: workspace.name,
    namespace,
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const updateWorkspace = api.workspace.updateWorkspace.useMutation({
    onSuccess: (data) => {
      form.reset(defaultValues);
      router.push(`/workspace/${data.namespace}/settings/general`);
      router.refresh();
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast.promise(
      updateWorkspace.mutateAsync({
        workspaceId: workspace.id,
        data: values,
      }),
      {
        loading: "Updating your workspace...",
        success: "Your workspace is updated.",
        error: handleTrpcError,
      },
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workspace Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder={workspace.name} data-1p-ignore />
              </FormControl>
              <FormDescription>
                This is your workspace&apos;s visible name within Flojoy Cloud.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="namespace"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workspace URL</FormLabel>
              <FormControl>
                <div className="flex gap-1.5">
                  <div className="h-10 w-fit whitespace-nowrap rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground opacity-50 ring-offset-background  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    {env.NEXT_PUBLIC_URL_ORIGIN}/
                  </div>
                  <Input placeholder={workspace.namespace} {...field} />
                </div>
              </FormControl>
              <FormDescription>
                This is your workspace&apos;s URL namespace on Flojoy Cloud.
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
          <DeleteWorkspace workspaceId={workspace.id} />
        </div>
      </form>
    </Form>
  );
};

export default GeneralForm;

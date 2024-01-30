"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import { publicInsertWorkspaceSchema } from "~/types/workspace";
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
import { Input } from "~/components/ui/input";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Checkbox } from "~/components/ui/checkbox";
import { env } from "~/env";

const formSchema = publicInsertWorkspaceSchema;

const CreateWorkspaceForm = () => {
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      populateData: false,
    },
  });

  const createWorkspace = api.workspace.createWorkspace.useMutation({
    onSuccess: (data) => {
      router.push(`/workspace/${data.namespace}`);
      router.refresh();
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    toast.promise(createWorkspace.mutateAsync(values), {
      success: "Workspace created",
      loading: "Creating workspace...",
      error: (e: Error) => `Error creating workspace: ${e.toString()}`,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workspace Name</FormLabel>
              <FormControl>
                <Input placeholder="HiddenLevel" {...field} data-1p-ignore />
              </FormControl>
              <FormDescription>
                This is your workspace&apos;s visible name within Flojoy.
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
                  <Input placeholder="hiddenlevel" {...field} />
                </div>
              </FormControl>
              <FormDescription>
                This is your workspace’s URL namespace on Flojoy.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="populateData"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Include Example</FormLabel>
                <FormDescription>
                  Populate your workspace with an example project.
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          Create
        </Button>
      </form>
    </Form>
  );
};

export default CreateWorkspaceForm;

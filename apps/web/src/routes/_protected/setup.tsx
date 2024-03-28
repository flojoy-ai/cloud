import { createFileRoute, useRouter } from "@tanstack/react-router";
import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from "@/components/page-header";
import { useForm } from "react-hook-form";
import { handleError } from "@/lib/utils";
import { toast } from "sonner";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { CreateWorkspace, createWorkspace } from "@cloud/shared";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { env } from "@/env";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { getWorkspacesQueryOpts } from "@/lib/queries/workspace";

export const Route = createFileRoute("/_protected/setup")({
  component: Setup,
});

const formSchema = createWorkspace;

function Setup() {
  const form = useForm<CreateWorkspace>({
    resolver: typeboxResolver(formSchema),
    defaultValues: {
      populateData: false,
    },
  });
  const router = useRouter();
  const queryClient = useQueryClient();

  const createWorkspace = useMutation({
    mutationFn: async (values: CreateWorkspace) => {
      const { data, error } = await client.workspace.index.post(values);
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
      queryClient.invalidateQueries(getWorkspacesQueryOpts());
      router.navigate({
        to: `/workspace/$namespace`,
        params: { namespace: data.namespace },
      });
    },
  });

  const onSubmit = (values: CreateWorkspace) => {
    toast.promise(createWorkspace.mutateAsync(values), {
      success: "Workspace created",
      loading: "Creating workspace...",
      error: handleError,
    });
  };

  return (
    <div className="container max-w-screen-2xl">
      <PageHeader>
        <PageHeaderHeading>Welcome to Flojoy Cloud</PageHeaderHeading>
        <PageHeaderDescription>
          Let&apos;s get you set up with a new workspace.
        </PageHeaderDescription>
      </PageHeader>
      <div className="mx-auto max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Acme Corporation"
                      {...field}
                      data-1p-ignore
                    />
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
                        {env.VITE_SERVER_URL}/
                      </div>
                      <Input placeholder="acme" {...field} />
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
      </div>
    </div>
  );
}

export default Setup;

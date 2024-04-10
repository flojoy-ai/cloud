import { UpdateWorkspace, Workspace, updateWorkspace } from "@cloud/shared";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "sonner";
import { Icons } from "@/components/icons";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/client";
import {
  getWorkspaceQueryKey,
  getWorkspacesQueryKey,
} from "@/lib/queries/workspace";

type Props = {
  workspace: Workspace;
};

const WorkspaceGeneral = ({ workspace }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const updateWorkspaceForm = useForm<UpdateWorkspace>({
    resolver: typeboxResolver(updateWorkspace),
    defaultValues: {
      name: workspace.name,
      namespace: workspace.namespace,
    },
  });

  const updateWorkspaceMutation = useMutation({
    mutationFn: async (values: UpdateWorkspace) => {
      const { data, error } = await client.workspace.index.patch(values, {
        headers: { "flojoy-workspace-id": workspace.id },
      });
      if (error) {
        throw error.value;
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: getWorkspacesQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getWorkspaceQueryKey(data.namespace),
      });
      router.navigate({
        to: "/workspace/$namespace/settings/",
        params: { namespace: data.namespace },
        search: { tab: "general" },
      });
      toast.success("Workspace updated");
    },
  });

  function onUpdateWorkspaceFormSubmit(values: UpdateWorkspace) {
    return updateWorkspaceMutation.mutateAsync(values);
  }

  const deleteWorkspaceMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await client.workspace.index.delete(
        {},
        {
          headers: { "flojoy-workspace-id": workspace.id },
        },
      );
      if (error) {
        throw error.value;
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: getWorkspacesQueryKey(),
      });
      queryClient.invalidateQueries({
        queryKey: getWorkspaceQueryKey(data.namespace),
      });
      router.navigate({
        to: "/workspace/",
      });
      toast.success("Workspace deleted");
    },
  });

  function onDeleteWorkspaceSubmit() {
    return deleteWorkspaceMutation.mutateAsync();
  }

  return (
    <div className="space-y-4">
      <Form {...updateWorkspaceForm}>
        <form
          onSubmit={updateWorkspaceForm.handleSubmit(
            onUpdateWorkspaceFormSubmit,
          )}
          className="space-y-8"
        >
          <FormField
            control={updateWorkspaceForm.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Workspace Name</CardTitle>
                    <CardDescription>
                      This is your workspace&apos;s visible name within Flojoy.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormControl>
                      <Input
                        placeholder={workspace.name}
                        {...field}
                        data-1p-ignore
                      />
                    </FormControl>
                  </CardContent>
                  <CardFooter className="space-x-4 border-t px-6 py-4">
                    {updateWorkspaceForm.formState.isSubmitting ? (
                      <Button disabled={true}>
                        <Icons.spinner />
                      </Button>
                    ) : (
                      <Button>Save</Button>
                    )}
                    <FormMessage />
                  </CardFooter>
                </Card>
              </FormItem>
            )}
          />
          <FormField
            control={updateWorkspaceForm.control}
            name="namespace"
            render={({ field }) => (
              <FormItem>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl">Workspace URL</CardTitle>
                    <CardDescription>
                      This is your workspace’s URL namespace on Flojoy.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <FormControl>
                      <div className="flex gap-1.5">
                        <div className="flex h-10 w-min rounded-md border border-input bg-background px-3 py-2 text-sm text-muted-foreground opacity-50 ring-offset-background  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                          fijoy.app/workspace/
                        </div>
                        <Input placeholder={workspace.namespace} {...field} />
                      </div>
                    </FormControl>
                  </CardContent>
                  <CardFooter className="space-x-4 border-t px-6 py-4">
                    {updateWorkspaceForm.formState.isSubmitting ? (
                      <Button disabled={true}>
                        <Icons.spinner />
                      </Button>
                    ) : (
                      <Button>Save</Button>
                    )}
                    <FormMessage />
                  </CardFooter>
                </Card>
              </FormItem>
            )}
          />
        </form>
      </Form>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-xl">Delete Workspace</CardTitle>
          <CardDescription>
            This will permanently delete your workspace and all its data.
          </CardDescription>
        </CardHeader>
        <CardFooter className="space-x-4 border-t px-6 py-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your workspace and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDeleteWorkspaceSubmit}
                  className={buttonVariants({ variant: "destructive" })}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorkspaceGeneral;

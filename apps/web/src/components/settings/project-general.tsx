import { UpdateProjectSchema, Workspace } from "@cloud/shared";

import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Icons } from "@/components/icons";
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
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { client } from "@/lib/client";
import { getProjectQueryKey, getProjectsQueryKey } from "@/lib/queries/project";
import { Perm } from "@cloud/shared";
import { Project } from "@cloud/shared/src/schemas/public/Project";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type Props = {
  workspace: Workspace;
  project: Project;
  projectPerm: Perm;
};

const ProjectGeneral = ({ workspace, projectPerm, project }: Props) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const updateProjectForm = useForm<UpdateProjectSchema>({
    resolver: typeboxResolver(UpdateProjectSchema),
    defaultValues: {
      name: project.name,
      repoUrl: project.repoUrl ?? undefined,
    },
  });

  const updateProjectMutation = useMutation({
    mutationFn: async (values: UpdateProjectSchema) => {
      const { data, error } = await client
        .project({ projectId: project.id })
        .index.patch(values, {
          headers: { "flojoy-workspace-id": workspace.id },
        });
      if (error) {
        throw error.value;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getProjectQueryKey(project.id),
      });
      queryClient.invalidateQueries({
        queryKey: getProjectsQueryKey(),
      });
      toast.success("Test profile updated");
    },
  });

  function onUpdateProjectFormSubmit(values: UpdateProjectSchema) {
    return updateProjectMutation.mutateAsync(values);
  }

  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await client
        .project({ projectId: project.id })
        .index.delete(
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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getProjectQueryKey(project.id),
      });
      queryClient.invalidateQueries({
        queryKey: getProjectsQueryKey(),
      });
      router.navigate({
        to: "/workspace/$namespace/project",
        params: { namespace: workspace.namespace },
      });
      toast.success("Test profile deleted");
    },
  });

  function onDeleteWorkspaceSubmit() {
    return deleteProjectMutation.mutateAsync();
  }

  return (
    <div className="space-y-4">
      <Form {...updateProjectForm}>
        <form
          onSubmit={updateProjectForm.handleSubmit(onUpdateProjectFormSubmit)}
        >
          <Card className="space-y-8 p-6">
            <FormField
              control={updateProjectForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl">Test Profile Name</FormLabel>
                  <FormDescription>
                    This is your test profile&apos;s visible name within Flojoy.
                  </FormDescription>
                  <FormControl>
                    <Input
                      disabled={!projectPerm.canAdmin()}
                      placeholder={project.name}
                      {...field}
                      data-1p-ignore
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={updateProjectForm.control}
              name="repoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xl">Git repository URL</FormLabel>
                  <FormDescription>
                    This is the URL of your upstream test profile git repository
                    including the test sequencer files and test code.
                  </FormDescription>
                  <FormControl>
                    <Input
                      disabled={!projectPerm.canAdmin()}
                      placeholder={"https://example.com/repo.git"}
                      {...field}
                      data-1p-ignore
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {updateProjectForm.formState.isSubmitting ? (
              <Button disabled={true}>
                <Icons.spinner className="h-6 w-6" />
              </Button>
            ) : (
              <Button disabled={!projectPerm.canAdmin()}>Save</Button>
            )}
          </Card>
        </form>
      </Form>
      {projectPerm.canAdmin() && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-xl">Delete Production Line</CardTitle>
            <CardDescription>
              This will permanently delete your production line and all its
              data.
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
                    your production line and remove your data from our servers.
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
      )}
    </div>
  );
};

export default ProjectGeneral;

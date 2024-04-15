import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import {
  Perm,
  Project,
  ProjectUserInvite,
  ProjectUserWithUser,
  Workspace,
  WorkspaceUserWithUser,
  projectUserInvite,
} from "@cloud/shared";
import { ColumnDef, Row } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { useForm } from "react-hook-form";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { Icons } from "../icons";
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
import { Check, ChevronsUpDown, Trash2 } from "lucide-react";
import { client } from "@/lib/client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { getProjectUsersQueryKey } from "@/lib/queries/project";
import { useProjectUser } from "@/hooks/use-project-user";

type Props = {
  workspace: Workspace;
  project: Project;
  projectUsers: ProjectUserWithUser[];
  workspaceUsers: WorkspaceUserWithUser[];

  projectPerm: Perm;
};

const columns: ColumnDef<ProjectUserWithUser>[] = [
  {
    accessorKey: "user.email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    id: "actions",
    cell: DeleteProjectUser,
  },
];

function DeleteProjectUser({ row }: { row: Row<ProjectUserWithUser> }) {
  const queryClient = useQueryClient();
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await client
        .project({ projectId: row.original.projectId })
        .user.index.delete(
          { userId },
          { headers: { "flojoy-workspace-id": row.original.workspaceId } },
        );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getProjectUsersQueryKey(row.original.projectId),
      });
      toast.success(`User (${row.original.user.email}) deleted`);
    },
  });

  const { projectUser, projectUserPerm } = useProjectUser();

  if (
    row.original.userId === projectUser.userId ||
    !projectUserPerm.canAdmin()
  ) {
    return null;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <Trash2 className="h-5 w-5" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => deleteUserMutation.mutateAsync(row.original.userId)}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const ProjectUsers = ({
  workspace,
  projectUsers,
  project,
  workspaceUsers,
}: Props) => {
  const queryClient = useQueryClient();

  const [popoverOpen, setPopoverOpen] = useState(false);

  const projectUserInviteForm = useForm<ProjectUserInvite>({
    resolver: typeboxResolver(projectUserInvite),
    defaultValues: {
      role: "operator",
    },
  });

  const projectUserInviteMutation = useMutation({
    mutationFn: async (values: ProjectUserInvite) => {
      const { data, error } = await client
        .project({ projectId: project.id })
        .user.index.post(values, {
          headers: { "flojoy-workspace-id": workspace.id },
        });
      if (error) {
        throw error.value;
      }
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: getProjectUsersQueryKey(project.id),
      });
      toast.success(`Added ${variables.email} to ${project.name}!`);
    },
  });

  function onProjectUserInviteSubmit(values: ProjectUserInvite) {
    return projectUserInviteMutation.mutateAsync(values);
  }

  const usersNotInProject =
    workspaceUsers.filter(
      (wu) => !projectUsers.find((pu) => wu.userId === pu.userId),
    ) ?? [];
  const { projectUserPerm } = useProjectUser();

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Production Line Users</CardTitle>
          <CardDescription>
            Here you can manage all the users in this production line.
          </CardDescription>
        </CardHeader>

        {projectUserPerm.canAdmin() && (
          <CardContent>
            <Form {...projectUserInviteForm}>
              <form
                onSubmit={projectUserInviteForm.handleSubmit(
                  onProjectUserInviteSubmit,
                )}
                id="workspace-user-invite"
                className="flex gap-2"
              >
                <FormField
                  control={projectUserInviteForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="grow">
                      <FormControl>
                        <Popover
                          open={popoverOpen}
                          onOpenChange={(open) => setPopoverOpen(open)}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ?? "Select user"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="p-0">
                            <Command>
                              <CommandList>
                                <CommandInput placeholder="Search user..." />
                                <CommandEmpty>No user found.</CommandEmpty>
                                <CommandGroup>
                                  {usersNotInProject.map(({ user }) => (
                                    <CommandItem
                                      value={user.email}
                                      key={user.email}
                                      onSelect={() => {
                                        projectUserInviteForm.setValue(
                                          "email",
                                          user.email,
                                        );
                                        setPopoverOpen(false);
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          user.email === field.value
                                            ? "opacity-100"
                                            : "opacity-0",
                                        )}
                                      />
                                      {user.email}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={projectUserInviteForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex gap-2">
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="developer">
                                developer
                              </SelectItem>
                              <SelectItem value="operator">operator</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex gap-2">
                  {projectUserInviteForm.formState.isSubmitting ? (
                    <Button disabled={true}>
                      <Icons.spinner className="h-6 w-6" />
                    </Button>
                  ) : (
                    <Button type="submit" form="workspace-user-invite">
                      Add
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        )}
        <CardFooter className="space-x-4 px-6 py-4 ">
          <div className="w-full">
            <DataTable columns={columns} data={projectUsers} />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProjectUsers;

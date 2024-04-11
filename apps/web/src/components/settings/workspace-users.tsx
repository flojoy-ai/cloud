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
  Workspace,
  WorkspaceUser,
  WorkspaceUserInvite,
  workspaceUserInvite,
} from "@cloud/shared";
import { User } from "@cloud/shared/src/schemas/public/User";
import { ColumnDef, Row } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { useForm } from "react-hook-form";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getWorkspaceUsersQueryKey } from "@/lib/queries/workspace";
import { toast } from "sonner";
import { Input } from "../ui/input";
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
import { Trash2 } from "lucide-react";
import { client } from "@/lib/client";
import { useAuth } from "@/hooks/use-auth";

type WorkspaceUserWithUser = WorkspaceUser & { user: User };

type Props = {
  workspace: Workspace;
  workspaceUsers: WorkspaceUserWithUser[];
};

const columns: ColumnDef<WorkspaceUserWithUser>[] = [
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
    cell: DeleteWorkspaceUser,
  },
];

function DeleteWorkspaceUser({ row }: { row: Row<WorkspaceUserWithUser> }) {
  const queryClient = useQueryClient();
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await client.workspace.user.delete(
        { userId },
        { headers: { "flojoy-workspace-id": row.original.workspaceId } },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getWorkspaceUsersQueryKey(row.original.workspaceId),
      });
      toast.success(`User (${row.original.user.email}) deleted`);
    },
  });

  const { user } = useAuth();
  if (user?.id === row.original.userId || row.original.role === "owner") {
    // no reason to delete urself
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

const WorkspaceUsers = ({ workspace, workspaceUsers }: Props) => {
  const queryClient = useQueryClient();

  const workspaceUserInviteForm = useForm<WorkspaceUserInvite>({
    resolver: typeboxResolver(workspaceUserInvite),
    defaultValues: {
      role: "member",
    },
  });

  const workspaceUserInviteMutation = useMutation({
    mutationFn: async (values: WorkspaceUserInvite) => {
      const { data, error } = await client.workspace.invite.post(values, {
        headers: { "flojoy-workspace-id": workspace.id },
      });
      if (error) {
        throw error.value;
      }
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: getWorkspaceUsersQueryKey(workspace.namespace),
      });
      toast.success(`Invited ${data.email}`);
    },
  });

  function onWorkspaceUserInviteSubmit(values: WorkspaceUserInvite) {
    return workspaceUserInviteMutation.mutateAsync(values);
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Workspace Users</CardTitle>
          <CardDescription>
            Here you can manage all the users in your workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...workspaceUserInviteForm}>
            <form
              onSubmit={workspaceUserInviteForm.handleSubmit(
                onWorkspaceUserInviteSubmit,
              )}
              id="workspace-user-invite"
              className="flex gap-2"
            >
              <FormField
                control={workspaceUserInviteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="grow">
                    <FormControl>
                      <Input
                        type="email"
                        placeholder={"Email address"}
                        {...field}
                        data-1p-ignore
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={workspaceUserInviteForm.control}
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
                            <SelectItem value="admin">admin</SelectItem>
                            <SelectItem value="member">member</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                {workspaceUserInviteForm.formState.isSubmitting ? (
                  <Button disabled={true}>
                    <Icons.spinner />
                  </Button>
                ) : (
                  <Button type="submit" form="workspace-user-invite">
                    Invite
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="space-x-4 px-6 py-4 ">
          <div className="w-full">
            <DataTable columns={columns} data={workspaceUsers} />
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorkspaceUsers;

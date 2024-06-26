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
  WorkspaceUserInvite,
  WorkspaceUserWithUser,
  workspaceUserInvite,
} from "@cloud/shared";
import { ColumnDef, Row } from "@tanstack/react-table";
import { DataTable } from "../ui/data-table";
import { useForm } from "react-hook-form";
import { typeboxResolver } from "@hookform/resolvers/typebox";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getUserInvitesQueryKey,
  getWorkspaceUsersQueryKey,
} from "@/lib/queries/workspace";
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
import { useWorkspaceUser } from "@/hooks/use-workspace-user";
import { UserInvite } from "@cloud/shared/src/schemas/public/UserInvite";

type Props = {
  workspace: Workspace;
  workspaceUsers: WorkspaceUserWithUser[];
  userInvites: UserInvite[];
};

const workspaceUserColumns: ColumnDef<WorkspaceUserWithUser>[] = [
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

const userInviteColumns: ColumnDef<UserInvite>[] = [
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    id: "actions",
    cell: DeleteUserInvite,
  },
];

function DeleteWorkspaceUser({ row }: { row: Row<WorkspaceUserWithUser> }) {
  const queryClient = useQueryClient();
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      await client.workspace.user.index.delete(
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

  const { workspaceUserPerm } = useWorkspaceUser();
  const { user } = useAuth();
  if (
    user?.id === row.original.userId ||
    row.original.role === "owner" ||
    !workspaceUserPerm.canAdmin()
  ) {
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

function DeleteUserInvite({ row }: { row: Row<UserInvite> }) {
  const queryClient = useQueryClient();
  const deleteUserMutation = useMutation({
    mutationFn: async (email: string) => {
      await client.workspace.user.invite.delete(
        { email },
        { headers: { "flojoy-workspace-id": row.original.workspaceId } },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getUserInvitesQueryKey(row.original.workspaceId),
      });
      toast.success(`Invitation to (${row.original.email}) has been canceled`);
    },
  });

  const { workspaceUserPerm } = useWorkspaceUser();
  if (!workspaceUserPerm.canAdmin()) {
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
            onClick={() => deleteUserMutation.mutateAsync(row.original.email)}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const WorkspaceUsers = ({ workspace, workspaceUsers, userInvites }: Props) => {
  const queryClient = useQueryClient();

  const workspaceUserInviteForm = useForm<WorkspaceUserInvite>({
    resolver: typeboxResolver(workspaceUserInvite),
    defaultValues: {
      role: "member",
    },
  });

  const workspaceUserInviteMutation = useMutation({
    mutationFn: async (values: WorkspaceUserInvite) => {
      const { data, error } = await client.workspace.invite.index.post(values, {
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
      toast.success(
        `Invited ${data.email}, this user needs to login to accept the invite.`,
      );
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
            Here you can manage all the users in your workspace. <br />
            <div className="py-1" />
            Note that by default, a member will not have access to any of the
            production line, and an admin will have access to everything.
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
                    <Icons.spinner className="h-6 w-6" />
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
            <DataTable columns={workspaceUserColumns} data={workspaceUsers} />
            {userInvites.length > 0 && (
              <>
                <div className="py-2"></div>
                <CardTitle className="text-xl">Pending Invites</CardTitle>
                <div className="py-2"></div>
                <DataTable columns={userInviteColumns} data={userInvites} />
              </>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default WorkspaceUsers;

"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
} from "@cloud/ui/components/ui/alert-dialog";
import { Button } from "@cloud/ui/components/ui/button";
import { handleError } from "~/lib/utils";
import { api } from "~/trpc/react";

type Props = {
  workspaceId: string;
};

const DeleteWorkspace = ({ workspaceId }: Props) => {
  const router = useRouter();
  const deleteWorkspace = api.workspace.deleteWorkspaceById.useMutation({
    onSuccess: () => {
      router.push("/workspace");
      router.refresh();
    },
  });

  return (
    <AlertDialog>
      <Button variant="destructive" size="sm" asChild>
        <AlertDialogTrigger>Delete Workspace</AlertDialogTrigger>
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            workspace and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              toast.promise(deleteWorkspace.mutateAsync({ workspaceId }), {
                loading: "Deleting your workspace...",
                success: "Your workspace has been deleted.",
                error: handleError,
              })
            }
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteWorkspace;

"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWorkspace } from "~/app/(protected)/workspace/[namespace]/workspace-provider";
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
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

type Props = {
  projectId: string;
};

const DeleteProject = ({ projectId }: Props) => {
  const router = useRouter();
  const workspace = useWorkspace();
  const deleteProject = api.project.deleteProject.useMutation({
    onSuccess: () => {
      router.push(`/workspace/${workspace}`);
      router.refresh();
    },
  });

  return (
    <AlertDialog>
      <Button variant="destructive" size="sm" asChild>
        <AlertDialogTrigger>Delete Project</AlertDialogTrigger>
      </Button>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            project and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              toast.promise(deleteProject.mutateAsync({ projectId }), {
                loading: "Deleting your project...",
                success: "Your project has been deleted.",
                error: "Something went wrong :(",
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

export default DeleteProject;

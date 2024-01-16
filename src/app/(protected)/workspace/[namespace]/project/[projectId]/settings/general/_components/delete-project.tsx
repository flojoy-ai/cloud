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
} from "~/components/ui/alert-dialog";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

type Props = {
  projectId: string;
};

const DeleteProject = ({ projectId }: Props) => {
  const router = useRouter();
  const deleteProject = api.project.deleteProjectById.useMutation({
    onSuccess: () => {
      router.push("/dashboard");
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

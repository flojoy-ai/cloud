"use client";

import { toast } from "sonner";
import { Button } from "@cloud/ui/components/ui/button";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { handleError } from "~/lib/utils";

type Props = {
  workspaceId: string;
};

export function RejectInvite({ workspaceId }: Props) {
  const router = useRouter();
  const reject = api.user.rejectWorkspaceInvite.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  return (
    <Button
      size="sm"
      variant="secondary"
      disabled={reject.isPending}
      onClick={() =>
        toast.promise(reject.mutateAsync({ workspaceId }), {
          success: "Rejected invite!",
          error: handleError,
        })
      }
    >
      Reject
    </Button>
  );
}

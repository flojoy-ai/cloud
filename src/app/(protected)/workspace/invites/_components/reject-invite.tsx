"use client";

import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { handleTrpcError } from "~/lib/utils";

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
      disabled={reject.isLoading}
      onClick={() =>
        toast.promise(reject.mutateAsync({ workspaceId }), {
          success: "Rejected invite!",
          error: handleTrpcError,
        })
      }
    >
      Reject
    </Button>
  );
}

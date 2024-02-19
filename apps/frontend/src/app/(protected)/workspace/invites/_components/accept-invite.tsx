"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@cloud/ui/components/ui/button";
import { handleError } from "~/lib/utils";
import { api } from "~/trpc/react";

type Props = {
  workspaceId: string;
};

export function AcceptInvite({ workspaceId }: Props) {
  const router = useRouter();
  const accept = api.user.acceptWorkspaceInvite.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  return (
    <Button
      size="sm"
      disabled={accept.isPending}
      onClick={() =>
        toast.promise(accept.mutateAsync({ workspaceId }), {
          success: "Accepted invite! 🎉",
          error: handleError,
        })
      }
    >
      Accept
    </Button>
  );
}

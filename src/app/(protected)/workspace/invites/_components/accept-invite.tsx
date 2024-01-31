"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
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
      disabled={accept.isLoading}
      onClick={() =>
        toast.promise(accept.mutateAsync({ workspaceId }), {
          success: "Accepted invite! 🎉",
          error: "Something went wrong :(",
        })
      }
    >
      Accpet
    </Button>
  );
}

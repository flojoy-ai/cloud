"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@cloud/ui/components/ui/button";
import { handleError } from "~/lib/utils";
import { api } from "~/trpc/react";

type Props = {
  workspaceId: string;
};

const GenerateSecret = ({ workspaceId }: Props) => {
  const router = useRouter();
  const generateSecret = api.secret._createSecret.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  return (
    <Button
      onClick={() =>
        toast.promise(generateSecret.mutateAsync({ workspaceId }), {
          loading: "Creating your secret...",
          success: "Your secret is ready.",
          error: handleError,
        })
      }
      variant="secondary"
    >
      Generate Secret
    </Button>
  );
};

export default GenerateSecret;

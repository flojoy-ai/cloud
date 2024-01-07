"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";

const GenerateSecret = () => {
  const router = useRouter();
  const generateSecret = api.secret.createSecret.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  return (
    <Button
      onClick={() =>
        toast.promise(generateSecret.mutateAsync(), {
          loading: "Creating your secret...",
          success: "Your secret is ready.",
          error: "Something went wrong :(",
        })
      }
      variant="secondary"
    >
      Generate Secret
    </Button>
  );
};

export default GenerateSecret;

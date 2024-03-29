"use client";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@cloud/ui/components/ui/button";
import { handleError } from "~/lib/utils";
import { api } from "~/trpc/react";

const Page = () => {
  const [countdown, setCountdown] = useState<number>(0);
  const mutate = api.email.sendEmailVerification.useMutation();

  const sendEmailVerification = () => {
    toast.promise(mutate.mutateAsync(), {
      loading: "Sending verification email...",
      success: "Verification email sent",
      error: handleError,
    });
    setCountdown(60);
  };

  useEffect(() => {
    if (countdown > 0) {
      const interval = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);

      return () => {
        clearInterval(interval);
      };
    }
  }, [countdown]);

  return (
    <div>
      <div className="p-8">
        <div className="mx-auto flex w-full max-w-lg flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              We just sent you a verification email
            </h1>
            <p className="text-sm text-muted-foreground">
              Click the link in the email to verify your email address.
            </p>
          </div>

          <Button
            variant="secondary"
            disabled={countdown > 0}
            onClick={sendEmailVerification}
          >
            {countdown === 0 ? <>Resend</> : <>{countdown}s</>}
          </Button>
        </div>
      </div>

      <div className="py-4"></div>
    </div>
  );
};

export default Page;

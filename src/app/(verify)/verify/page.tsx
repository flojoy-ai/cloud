"use client";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";

const Page = () => {
  const [countdown, setCountdown] = useState<number>(0);

  const sendEmailVerification = async () => {
    try {
      const data = (await axios.post("/api/email-verification", {}))
        .data as Record<string, string>;
      toast.message(data.message);
    } catch (e) {
      if (axios.isAxiosError(e)) {
        toast.error(e.response?.data as string);
      } else {
        toast.error(String(e));
      }
    }
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

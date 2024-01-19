"use client";
import { useEffect, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

const Page = () => {
  // I want to implement a countdown after I press the resend button

  const [countdown, setCountdown] = useState<number>(0);

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
              Enter the code from the email below to verify your account
            </p>
          </div>

          <div className="flex gap-2">
            <Input />
            <Button
              variant="secondary"
              onClick={async () => {
                await fetch("/api/email", { method: "POST" });
                setCountdown(60);
              }}
            >
              {countdown === 0 ? <>Resend</> : <>{countdown}s</>}
            </Button>
          </div>
          <Button>Verify</Button>
        </div>
      </div>

      <div className="py-4"></div>
    </div>
  );
};

export default Page;

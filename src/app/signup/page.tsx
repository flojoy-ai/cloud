import Link from "next/link";
import { Button } from "~/components/ui/button";

export default async function SignUp() {
  return (
    <div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            {/* <p className="text-muted-foreground text-sm"> */}
            {/*   Enter your email below to create your account */}
            {/* </p> */}
          </div>

          <Button asChild>
            <Link href="/login/auth0">Continue</Link>
          </Button>

          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}

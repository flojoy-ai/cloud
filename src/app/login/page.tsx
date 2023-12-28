import Link from "next/link";
import TermsAndPrivacy from "~/components/terms-and-privacy";
import { Button } from "~/components/ui/button";

export default async function LogIn() {
  return (
    <div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Log in to your account
            </h1>
            {/* <p className="text-muted-foreground text-sm"> */}
            {/*   Enter your email below to create your account */}
            {/* </p> */}
          </div>

          <Button asChild>
            <Link href="/login/auth0">Continue</Link>
          </Button>

          <TermsAndPrivacy />
        </div>
      </div>
    </div>
  );
}

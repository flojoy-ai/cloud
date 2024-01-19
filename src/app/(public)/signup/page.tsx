import Link from "next/link";
import Form from "~/components/form";
import { Icons } from "~/components/icons";
import TermsAndPrivacy from "~/components/terms-and-privacy";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

export default async function SignUp() {
  return (
    <div>
      <div className="p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Let's get started!
            </h1>
            {/* <p className="text-muted-foreground text-sm"> */}
            {/*   Enter your email below to create your account */}
            {/* </p> */}
          </div>
          <Form action="/api/signup">
            <Label htmlFor="email">Email</Label>
            <Input name="email" id="email" />
            <div className="py-1"></div>
            <Label htmlFor="password">Password</Label>
            <Input type="password" name="password" id="password" />
            <div className="py-1"></div>
            <Button className="w-full" type="submit">
              Create my account
            </Button>
          </Form>

          <Button asChild variant="secondary">
            <Link href="/login/google" className="flex gap-2">
              <Icons.google className="h-4 w-4" />
              Continue with Google
            </Link>
          </Button>

          <TermsAndPrivacy />
        </div>
      </div>

      <div className="py-4"></div>
    </div>
  );
}

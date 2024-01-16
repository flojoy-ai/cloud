import Link from "next/link";
import { Button } from "~/components/ui/button";

function NotFoundPage() {
  return (
    <>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Oops! Page not found :(
            </h1>
            <p className="text-sm text-muted-foreground">
              Please double check if you typed the correct URL.
            </p>
          </div>

          <Button asChild>
            <Link href="/workspace">Return to dashboard</Link>
          </Button>

          <Button asChild variant="secondary">
            <Link href="/">Go back to home</Link>
          </Button>
        </div>
      </div>

      <div className="py-4"></div>
    </>
  );
}

export default NotFoundPage;

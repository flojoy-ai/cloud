import { env } from "~/env";
import { Button } from "@cloud/ui/components/ui/button";

export async function TailwindIndicator() {
  if (env.NODE_ENV === "production") return null;

  return (
    <div className="fixed bottom-1 left-1 z-50 flex items-center justify-center gap-1">
      <Button size="sm">
        <div className="block sm:hidden">xs</div>
        <div className="hidden sm:block md:hidden">sm</div>
        <div className="hidden md:block lg:hidden">md</div>
        <div className="hidden lg:block xl:hidden">lg</div>
        <div className="hidden xl:block 2xl:hidden">xl</div>
        <div className="hidden 2xl:block">2xl</div>
      </Button>
    </div>
  );
}

import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";
import { Icons } from "../icons";
import { buttonVariants } from "../ui/button";

const ExternalLinks = () => {
  return (
    <>
      <a href={siteConfig.links.github} target="_blank" rel="noreferrer">
        <div className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
          <Icons.github className="h-4 w-4" />
          <span className="sr-only">GitHub</span>
        </div>
      </a>
      <a href={siteConfig.links.discord} target="_blank" rel="noreferrer">
        <div className={cn(buttonVariants({ variant: "ghost", size: "icon" }))}>
          <Icons.discord className="h-4 w-4" />
          <span className="sr-only">Discord</span>
        </div>
      </a>
    </>
  );
};

export default ExternalLinks;

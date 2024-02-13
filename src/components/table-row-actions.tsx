import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
} from "~/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";

type ActionsProps = {
  elem: { id: string };
  children?: React.ReactNode;
};

const Actions = ({ elem, children }: ActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() =>
            toast.promise(navigator.clipboard.writeText(elem.id), {
              success: "Copied to clipboard",
              error: "Something went wrong :(",
            })
          }
        >
          Copy ID
        </DropdownMenuItem>
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Actions;

"use client";

import { toast } from "sonner";
import {
  ContextMenuContent,
  ContextMenuItem,
} from "~/components/ui/context-menu";

type Props = {
  value: string;
};

const CopyIdContextMenu = ({ value }: Props) => {
  return (
    <ContextMenuContent>
      <ContextMenuItem
        onClick={() => {
          toast.promise(navigator.clipboard.writeText(value), {
            success: "Copied to clipboard",
            error: "Something went wrong :(",
          });
        }}
      >
        Copy ID
      </ContextMenuItem>
    </ContextMenuContent>
  );
};
export default CopyIdContextMenu;

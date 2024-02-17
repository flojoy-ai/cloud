"use client";

import { toast } from "sonner";
import { ContextMenuItem } from "@cloud/ui/components/ui/context-menu";

type Props = {
  value: string;
};

const CopyIdContextMenuItem = ({ value }: Props) => {
  return (
    <ContextMenuItem
      onClick={() => {
        toast.promise(navigator.clipboard.writeText(value), {
          success: "Copied to clipboard",
          error: (err) => "Failed to copy: " + String(err),
        });
      }}
    >
      Copy ID
    </ContextMenuItem>
  );
};
export default CopyIdContextMenuItem;

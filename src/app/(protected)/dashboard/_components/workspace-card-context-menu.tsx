"use client";

import { toast } from "sonner";
import {
  ContextMenuContent,
  ContextMenuItem,
} from "~/components/ui/context-menu";
import { type SelectWorkspace } from "~/types/workspace";

type Props = {
  workspace: SelectWorkspace;
};

const WorkspaceCardContextMenu = ({ workspace }: Props) => {
  return (
    <ContextMenuContent>
      <ContextMenuItem
        onClick={() => {
          toast.promise(navigator.clipboard.writeText(workspace.id), {
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
export default WorkspaceCardContextMenu;

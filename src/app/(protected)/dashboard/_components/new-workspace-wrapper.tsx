"use client";

import { useState } from "react";
import NewWorkspace from "./new-workspace";
import { Button } from "~/components/ui/button";

const NewWorkspaceButton = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        New Workspace
      </Button>
      <NewWorkspace isDialogOpen={open} setIsDialogOpen={setOpen} />
    </>
  );
};

export default NewWorkspaceButton;

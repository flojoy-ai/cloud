"use client";

import { useState } from "react";
import NewWorkspace from "./new-workspace";

const NewWorkspaceButton = () => {
  const [open, setOpen] = useState(false);
  return <NewWorkspace isDialogOpen={open} setIsDialogOpen={setOpen} />;
};

export default NewWorkspaceButton;

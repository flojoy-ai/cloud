"use client";

import { toast } from "sonner";
import { Button } from "@cloud/ui/components/ui/button";

type Props = {
  value: string;
};

const CopyButton = ({ value }: Props) => {
  return (
    <Button
      onClick={() => {
        toast.promise(navigator.clipboard.writeText(value), {
          success: "Copied to clipboard",
          error: (err) => "Failed to copy: " + String(err),
        });
      }}
      size="sm"
    >
      Copy
    </Button>
  );
};

export default CopyButton;

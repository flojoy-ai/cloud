"use client";

import { toast } from "sonner";
import { Button } from "~/components/ui/button";

type Props = {
  value: string;
};

const CopyButton = ({ value }: Props) => {
  return (
    <Button
      onClick={() => {
        toast.promise(navigator.clipboard.writeText(value), {
          success: "Copied to clipboard",
          error: "Something went wrong :(",
        });
      }}
      size="sm"
    >
      Copy
    </Button>
  );
};

export default CopyButton;

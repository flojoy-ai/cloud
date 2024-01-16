"use client";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Clipboard } from "lucide-react";

type Props = {
  code: string;
};

const CopyButton = ({ code }: Props) => {
  return (
    <Button
      size="icon"
      variant="outline"
      className="absolute right-4 top-4"
      onClick={() => {
        toast.promise(navigator.clipboard.writeText(code), {
          success: "Copied to clipboard",
          error: "Something went wrong :(",
        });
      }}
    >
      <Clipboard size={24} />
    </Button>
  );
};

export default CopyButton;

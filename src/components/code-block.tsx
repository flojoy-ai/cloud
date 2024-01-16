"use client";

import { toast } from "sonner";
import { Button } from "./ui/button";
import { Clipboard } from "lucide-react";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";

import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";

SyntaxHighlighter.registerLanguage("python", python);

type Props = {
  code: string;
};

const CodeBlock = ({ code }: Props) => {
  return (
    <div className="relative">
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

      <SyntaxHighlighter
        language="python"
        style={oneDark}
        className="hidden dark:block"
      >
        {code}
      </SyntaxHighlighter>
      <SyntaxHighlighter
        language="python"
        style={oneLight}
        className="dark:hidden"
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;

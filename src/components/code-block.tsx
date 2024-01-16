import { Code } from "bright";
import CopyButton from "./copy-button";

type Props = {
  code: string;
};

Code.theme = {
  dark: "github-dark",
  light: "github-light",
};

const CodeBlock = ({ code }: Props) => {
  return (
    <div className="relative">
      <CopyButton code={code} />
      <div data-theme="light" className="dark:hidden">
        <Code lang="py">{code}</Code>
      </div>
      <div data-theme="dark" className="hidden dark:block">
        <Code lang="py">{code}</Code>
      </div>
    </div>
  );
};

export default CodeBlock;

import Link from "next/link";

export const WorkspaceAPIKeyReminder = ({
  namespace,
}: {
  namespace: string;
}) => {
  return (
    <div className="text-sm">
      To get your API key, go to{" "}
      <Link
        href={`/workspace/${namespace}/settings/secret`}
        className="underline hover:opacity-70"
      >
        your workspace settings.
      </Link>
    </div>
  );
};

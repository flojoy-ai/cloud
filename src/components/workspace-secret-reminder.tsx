import Link from "next/link";

type Props = {
  workspaceId: string;
};

export const WorkspaceSecretReminder = ({ workspaceId }: Props) => {
  return (
    <div className="text-sm">
      To get your workspace secret, go to{" "}
      <Link
        href={`/workspace/${workspaceId}/settings/secret`}
        className="underline hover:opacity-70"
      >
        your workspace settings.
      </Link>
    </div>
  );
};

import Link from "next/link";

export const WorkspaceSecretReminder = ({
  namespace,
}: {
  namespace: string;
}) => {
  return (
    <div className="text-sm">
      To get your workspace secret, go to{" "}
      <Link
        href={`/${namespace}/settings/secret`}
        className="underline hover:opacity-70"
      >
        your workspace settings.
      </Link>
    </div>
  );
};

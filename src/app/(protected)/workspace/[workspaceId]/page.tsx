export default async function Workspace({
  params,
}: {
  params: { workspaceId: string };
}) {
  return <div>{params.workspaceId}</div>;
}

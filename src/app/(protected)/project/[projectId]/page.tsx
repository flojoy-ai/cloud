export default async function Project({
  params,
}: {
  params: { projectId: string };
}) {
  return <div>{params.projectId}</div>;
}

import { api } from "~/trpc/server";

const SettingsView = async ({ params }: { params: { projectId: string } }) => {
  const project = await api.project.getProjectById.query({
    projectId: params.projectId,
  });

  return (
    <div>
      <div>SettingsView</div>
      <div>{project.id}</div>
    </div>
  );
};

export default SettingsView;

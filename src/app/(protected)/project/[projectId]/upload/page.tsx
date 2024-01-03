import { api } from "~/trpc/server";

const UploadView = async ({ params }: { params: { projectId: string } }) => {
  const project = await api.project.getProjectById.query({
    projectId: params.projectId,
  });

  return (
    <div>
      <div>UploadView</div>
      <div>{project.id}</div>
    </div>
  );
};

export default UploadView;

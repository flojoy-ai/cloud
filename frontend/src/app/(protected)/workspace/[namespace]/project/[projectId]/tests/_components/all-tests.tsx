import { Project } from "~/schemas/public/Project";
import TestCard from "./test-card";
import { api } from "~/trpc/server";

type Props = {
  project: Project;
  namespace: string;
};

const AllTests = async ({ project, namespace }: Props) => {
  const tests = await api.test.getAllTestsByProjectId.query({
    projectId: project.id,
  });

  return (
    <div>
      {tests.length === 0 && (
        <div className="">No test found, get started by creating a test.</div>
      )}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
        {tests.map((test) => (
          <TestCard test={test} key={test.id} namespace={namespace} />
        ))}
      </div>
    </div>
  );
};

export default AllTests;

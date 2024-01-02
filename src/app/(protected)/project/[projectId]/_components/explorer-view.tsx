"use client";

import { api } from "~/trpc/react";
import { type SelectProject } from "~/types/project";
import ExplorerVisualization from "./explorer/explorer-visualization";

type Props = {
  project: SelectProject;
};

const ExplorerView = ({ project }: Props) => {
  const { data: tests } = api.test.getAllTestsByProjectId.useQuery({
    projectId: project.id,
  });

  if (!tests) {
    return null;
  }

  return (
    <div>
      <div className="py-1"></div>
      <ExplorerVisualization tests={tests} />
    </div>
  );
};

export default ExplorerView;

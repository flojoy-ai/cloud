"use client";

import { WorkspaceCombobox } from "./workspace-combobox";
import { useShallow } from "zustand/react/shallow";
import { useExplorerStore } from "~/store/explorer";
import { ProjectCombobox } from "./project-combobox";
import { TestCombobox } from "./test-combobox";
import { api } from "~/trpc/react";

const ExplorerView = () => {
  const { selectedWorkspace, selectedProject } = useExplorerStore(
    useShallow((state) => ({
      selectedWorkspace: state.selectedWorkspace,
      selectedProject: state.selectedProject,
    })),
  );

  const { data: workspaces } = api.workspace.getAllWorkspaces.useQuery();
  const { data: projects } = api.project.getAllProjects.useQuery({
    workspaceId: selectedWorkspace?.id ?? "",
  });
  const { data: tests } = api.test.getAllTests.useQuery({
    projectId: selectedProject?.id ?? "",
  });

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        <WorkspaceCombobox workspaces={workspaces ?? []} />
        <ProjectCombobox projects={projects ?? []} />
        <TestCombobox tests={tests ?? []} />
      </div>
    </div>
  );
};

export default ExplorerView;

"use client";

import { WorkspaceCombobox } from "./workspace-combobox";
import { useShallow } from "zustand/react/shallow";
import { useExplorerStore } from "~/store/explorer";
import { ProjectCombobox } from "./project-combobox";
import { TestCombobox } from "./test-combobox";
import { api } from "~/trpc/react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

const ExplorerView = () => {
  const { selectedWorkspace, selectedProject } = useExplorerStore(
    useShallow((state) => ({
      selectedWorkspace: state.selectedWorkspace,
      selectedProject: state.selectedProject,
    })),
  );

  const { data: workspaces } = api.workspace.getAllWorkspaces.useQuery();
  const { data: projects } = api.project.getAllProjectsByWorkspaceId.useQuery({
    workspaceId: selectedWorkspace?.id ?? "",
  });
  const { data: tests } = api.test.getAllTestsByProjectId.useQuery({
    projectId: selectedProject?.id ?? "",
  });

  return (
    <div>
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Select workspace</CardTitle>
            </CardHeader>
            <CardContent>
              <WorkspaceCombobox workspaces={workspaces ?? []} />
            </CardContent>
            <CardFooter>
              {workspaces?.length === 0 && (
                <div>There is no workspace in your account</div>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select project</CardTitle>
            </CardHeader>
            <CardContent>
              <ProjectCombobox projects={projects ?? []} />
            </CardContent>
            <CardFooter>
              {!selectedWorkspace && (
                <div>You must select a workspace first</div>
              )}
              {selectedWorkspace && projects?.length === 0 && (
                <div>There is no project in the selected workspace</div>
              )}
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Select test</CardTitle>
            </CardHeader>
            <CardContent>
              <TestCombobox tests={tests ?? []} />
            </CardContent>
            <CardFooter>
              {!selectedProject && <div>You must select a project first</div>}
              {selectedProject && tests?.length === 0 && (
                <div>There is no test in the selected project</div>
              )}
            </CardFooter>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default ExplorerView;
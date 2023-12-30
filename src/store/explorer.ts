import { create } from "zustand";
import { type SelectDevice } from "~/types/device";
import { type SelectProject } from "~/types/project";
import { type SelectTest } from "~/types/test";
import { type SelectWorkspace } from "~/types/workspace";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ExplorerStore {
  selectedWorkspace: SelectWorkspace | undefined;
  setSelectedWorkspace: (workspace: SelectWorkspace | undefined) => void;
  selectedProject: SelectProject | undefined;
  setSelectedProject: (project: SelectProject | undefined) => void;
  selectedDevice: SelectDevice | undefined;
  setSelectedDevice: (device: SelectDevice | undefined) => void;
  selectedTest: SelectTest | undefined;
  setSelectedTest: (test: SelectTest | undefined) => void;
}

export const useExplorerStore = create<ExplorerStore>()(
  persist(
    (set) => ({
      selectedWorkspace: undefined,
      setSelectedWorkspace: (workspace) =>
        set((state) => ({ ...state, selectedWorkspace: workspace })),
      selectedProject: undefined,
      setSelectedProject: (project) =>
        set((state) => ({ ...state, selectedProject: project })),
      selectedDevice: undefined,
      setSelectedDevice: (device) =>
        set((state) => ({ ...state, selectedDevice: device })),
      selectedTest: undefined,
      setSelectedTest: (test) =>
        set((state) => ({ ...state, selectedTest: test })),
    }),
    {
      name: "explorer-storage",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

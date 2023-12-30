import { create } from "zustand";
import { type SelectDevice } from "~/types/device";
import { type SelectTest } from "~/types/test";
import { persist, createJSONStorage } from "zustand/middleware";

export interface ExplorerStore {
  selectedDevice: SelectDevice | undefined;
  setSelectedDevice: (device: SelectDevice | undefined) => void;
  selectedTest: SelectTest | undefined;
  setSelectedTest: (test: SelectTest | undefined) => void;
}

export const useExplorerStore = create<ExplorerStore>()(
  persist(
    (set) => ({
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

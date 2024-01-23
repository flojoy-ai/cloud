import { create } from "zustand";
import { type SelectHardware } from "~/types/hardware";
import { type SelectTest } from "~/types/test";
import { persist, createJSONStorage } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export interface ExplorerStore {
  selectedHardware: SelectHardware | undefined;
  setSelectedHardware: (hardware: SelectHardware | undefined) => void;
  selectedTest: SelectTest | undefined;
  setSelectedTest: (test: SelectTest | undefined) => void;
}

export const useExplorerStore = create<ExplorerStore>()(
  immer(
    persist(
      (set) => ({
        selectedHardware: undefined,
        setSelectedHardware: (hardware) =>
          set((state) => ({ ...state, selectedHardware: hardware })),
        selectedTest: undefined,
        setSelectedTest: (test) =>
          set((state) => ({ ...state, selectedTest: test })),
      }),
      {
        name: "explorer-storage",
        storage: createJSONStorage(() => sessionStorage),
      },
    ),
  ),
);

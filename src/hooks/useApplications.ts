import { useCallback, useEffect, useState } from "react";
import type {
  Application,
  ApplicationInput,
  ApplicationPatch,
} from "../types";
import * as storage from "../storage";

/**
 * React binding over the storage module. Keeps a live copy of the ledger in
 * state and re-syncs whenever storage notifies (local writes *and* cross-tab
 * `storage` events). All mutations go through storage.ts.
 */
export function useApplications() {
  const [applications, setApplications] = useState<Application[]>(() =>
    storage.loadApplications(),
  );

  useEffect(
    () => storage.subscribe(() => setApplications(storage.loadApplications())),
    [],
  );

  const add = useCallback(
    (input: ApplicationInput) => storage.addApplication(input),
    [],
  );

  const update = useCallback(
    (id: string, patch: ApplicationPatch) =>
      storage.updateApplication(id, patch),
    [],
  );

  const remove = useCallback((id: string) => storage.deleteApplication(id), []);

  const exportJson = useCallback(() => storage.exportData(), []);

  const importJson = useCallback((json: string) => storage.importData(json), []);

  return {
    applications,
    add,
    update,
    remove,
    exportJson,
    importJson,
  };
}

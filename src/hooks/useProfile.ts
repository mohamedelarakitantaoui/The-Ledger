import { useCallback, useEffect, useState } from "react";
import type { Profile } from "../types";
import * as storage from "../storage";

/** React binding over the master profile in storage.ts. */
export function useProfile() {
  const [profile, setProfile] = useState<Profile>(() => storage.loadProfile());

  useEffect(
    () => storage.subscribe(() => setProfile(storage.loadProfile())),
    [],
  );

  const save = useCallback((next: Profile) => storage.saveProfile(next), []);

  return { profile, save };
}

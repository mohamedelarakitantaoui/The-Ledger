import { useCallback, useEffect, useState } from "react";
import type { DocType, GeneratedDoc, GeneratedDocInput } from "../types";
import * as storage from "../storage";

/** React binding over the generated-documents store in storage.ts. */
export function useDocuments() {
  const [documents, setDocuments] = useState<GeneratedDoc[]>(() =>
    storage.loadDocuments(),
  );

  useEffect(
    () => storage.subscribe(() => setDocuments(storage.loadDocuments())),
    [],
  );

  const add = useCallback(
    (input: GeneratedDocInput) => storage.addDocument(input),
    [],
  );

  const update = useCallback(
    (id: string, patch: Partial<GeneratedDocInput>) =>
      storage.updateDocument(id, patch),
    [],
  );

  const remove = useCallback((id: string) => storage.deleteDocument(id), []);

  const setFinal = useCallback(
    (applicationId: string, type: DocType, docId: string) =>
      storage.setFinalDocument(applicationId, type, docId),
    [],
  );

  return { documents, add, update, remove, setFinal };
}

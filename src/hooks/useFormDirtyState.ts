import { useState, useCallback } from "react";

interface UseDirtyStateReturn<T extends Record<string, unknown>> {
  dirtyFields: Set<keyof T>;
  markDirty: (field: keyof T) => void;
  markClean: (field: keyof T) => void;
  isDirty: (field: keyof T) => boolean;
  isFormDirty: boolean;
  resetDirtyState: () => void;
}

export function useFormDirtyState<T extends Record<string, unknown>>(
  initialFields?: (keyof T)[]
): UseDirtyStateReturn<T> {
  const [dirtyFields, setDirtyFields] = useState<Set<keyof T>>(
    new Set(initialFields || [])
  );

  const markDirty = useCallback((field: keyof T) => {
    setDirtyFields((prev) => new Set(prev).add(field));
  }, []);

  const markClean = useCallback((field: keyof T) => {
    setDirtyFields((prev) => {
      const next = new Set(prev);
      next.delete(field);
      return next;
    });
  }, []);

  const isDirty = useCallback(
    (field: keyof T) => dirtyFields.has(field),
    [dirtyFields]
  );

  const isFormDirty = dirtyFields.size > 0;

  const resetDirtyState = useCallback(() => {
    setDirtyFields(new Set());
  }, []);

  return {
    dirtyFields,
    markDirty,
    markClean,
    isDirty,
    isFormDirty,
    resetDirtyState,
  };
}

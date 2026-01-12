import * as React from "react";
import { createContext, useContext } from "react";

// Context to share dirty state across form fields
interface FormDirtyContextType {
  isDirty: (field: string) => boolean;
  markDirty: (field: string) => void;
}

export const FormDirtyContext = createContext<FormDirtyContextType | null>(null);

export const useFormDirtyContext = () => {
  return useContext(FormDirtyContext);
};

// Helper to get field state classes
export const getFieldStateClasses = (isDirty: boolean) => {
  if (isDirty) {
    return "bg-field-dirty-bg border-field-dirty-border border-2 shadow-sm";
  }
  return "bg-field-pristine-bg border-field-pristine-border";
};

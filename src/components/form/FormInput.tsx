import * as React from "react";
import { cn } from "@/lib/utils";
import { useFormDirtyContext, getFieldStateClasses } from "@/components/form/FormDirtyContext";

export interface FormInputProps extends React.ComponentProps<"input"> {
  fieldName?: string;
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, type, fieldName, onChange, ...props }, ref) => {
    const dirtyContext = useFormDirtyContext();
    const isDirty = fieldName && dirtyContext ? dirtyContext.isDirty(fieldName) : false;
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (fieldName && dirtyContext) {
        dirtyContext.markDirty(fieldName);
      }
      onChange?.(e);
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all duration-200",
          getFieldStateClasses(isDirty),
          className,
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    );
  },
);
FormInput.displayName = "FormInput";

export { FormInput };

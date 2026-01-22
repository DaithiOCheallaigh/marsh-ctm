import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast";
import { AlertCircle, CheckCircle2, ChevronDown } from "lucide-react";

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        const isDestructive = variant === "destructive";
        const Icon = isDestructive ? AlertCircle : CheckCircle2;
        
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <Icon className="h-4 w-4 flex-shrink-0" />
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                {title && <ToastTitle className="font-semibold">[{title}:]</ToastTitle>}
                {description && <ToastDescription className="truncate">[{description}]</ToastDescription>}
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <ChevronDown className="h-4 w-4 opacity-60" />
              {action}
            </div>
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

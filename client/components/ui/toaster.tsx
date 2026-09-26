import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { CheckCircle2, XCircle, Info } from "lucide-react";

function ToastIcon({ variant }: { variant?: string | null }) {
  if (variant === "destructive") {
    return (
      <div className="mt-0.5 flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-red-100">
        <XCircle className="h-4 w-4 text-red-600" />
      </div>
    );
  }
  if (variant === "success") {
    return (
      <div className="mt-0.5 flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100">
        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
      </div>
    );
  }
  return (
    <div className="mt-0.5 flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100">
      <Info className="h-4 w-4 text-violet-600" />
    </div>
  );
}

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, variant, ...props }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            {/* Left colored bar */}
            <div
              className={`absolute left-0 top-0 h-full w-1 rounded-l-2xl ${
                variant === "destructive"
                  ? "bg-red-500"
                  : variant === "success"
                  ? "bg-emerald-500"
                  : "bg-violet-500"
              }`}
            />

            <ToastIcon variant={variant} />

            <div className="flex-1 min-w-0">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>

            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

import { useEffect } from "react";

export interface ToastData {
  id: number;
  message: string;
  tone: "info" | "error";
}

interface Props {
  toast: ToastData | null;
  onDismiss: () => void;
}

export function Toast({ toast, onDismiss }: Props) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 3600);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div
        role="status"
        className="animate-rise pointer-events-auto flex items-center gap-3 rounded-full border border-line bg-elevated/95 px-5 py-3 shadow-2xl backdrop-blur"
      >
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: toast.tone === "error" ? "#B5604F" : "#5FA37A",
          }}
          aria-hidden
        />
        <span className="text-sm text-ink">{toast.message}</span>
      </div>
    </div>
  );
}

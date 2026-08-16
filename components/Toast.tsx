interface ToastProps {
  message: string | null;
  tone?: "error" | "info";
}

export function Toast({ message, tone = "error" }: ToastProps) {
  if (!message) return null;
  const styles =
    tone === "error"
      ? "border-red-500/30 bg-red-500/10 text-red-300"
      : "border-amber-500/30 bg-amber-500/10 text-amber-300";
  return <div className={`mt-4 rounded-lg border px-4 py-3 text-sm ${styles}`}>{message}</div>;
}

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Toast = { id: number; message: string; type?: "success" | "error" };
const ToastContext = createContext<{ toast: (message: string, type?: Toast["type"]) => void } | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const value = useMemo(
    () => ({
      toast: (message: string, type: Toast["type"] = "success") => {
        const id = Date.now();
        setItems((current) => [...current, { id, message, type }]);
        window.setTimeout(() => setItems((current) => current.filter((item) => item.id !== id)), 3200);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-4 z-[60] grid gap-2">
        <AnimatePresence>
          {items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-soft ${item.type === "error" ? "bg-red-500 text-white" : "bg-emerald-400 text-white"}`}
            >
              {item.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used inside ToastProvider");
  return context;
}

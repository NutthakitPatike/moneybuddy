import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "./Button";
import { Card } from "./Card";

export function Modal({
  open,
  title,
  children,
  onClose
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-cocoa/40 p-4 backdrop-blur-sm">
      <Card className="max-h-[92vh] w-full max-w-2xl overflow-auto">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-cocoa">{title}</h2>
          <Button type="button" variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X size={18} />
          </Button>
        </div>
        {children}
      </Card>
    </div>
  );
}

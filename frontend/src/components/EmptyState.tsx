import { Sparkles } from "lucide-react";
import { Card } from "./ui/Card";

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <Card className="grid place-items-center gap-2 py-12 text-center">
      <div className="grid h-12 w-12 place-items-center rounded-full bg-mint text-emerald-700">
        <Sparkles size={22} />
      </div>
      <h3 className="font-bold text-cocoa">{title}</h3>
      <p className="max-w-md text-sm text-cocoa/70">{text}</p>
    </Card>
  );
}

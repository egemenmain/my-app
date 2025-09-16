import { Clock, Utensils, CalendarDays } from "lucide-react";
type Item = { icon: "clock" | "meal" | "calendar"; value: string; label: string };
const map = { clock: Clock, meal: Utensils, calendar: CalendarDays } as const;
export default function StatStrip({ items }: { items: Item[] }) {
    return <div className="grid gap-3 rounded-2xl border bg-white/70 p-4 shadow-sm md:grid-cols-3">
        {items.map((it, i) => {
            const Icon = map[it.icon]; return (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <Icon className="h-6 w-6" aria-hidden="true" />
                    <div><div className="text-lg font-semibold leading-none">{it.value}</div>
                        <div className="text-sm text-gray-600">{it.label}</div></div>
                </div>
            );
        })}
    </div>;
}
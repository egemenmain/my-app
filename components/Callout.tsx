export default function Callout({
    tone = "info", title, children,
}: { tone?: "info" | "success" | "warning" | "danger"; title: string; children: React.ReactNode }) {
    const map = {
        info: "bg-blue-50 border-blue-200", success: "bg-green-50 border-green-200",
        warning: "bg-amber-50 border-amber-200", danger: "bg-red-50 border-red-200",
    } as const;
    return <div className={`rounded-xl border p-4 ${map[tone]} text-sm`}>
        <p className="mb-1 font-semibold">{title}</p><div className="text-gray-700">{children}</div>
    </div>;
}
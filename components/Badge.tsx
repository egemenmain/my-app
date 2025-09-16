export default function Badge({ children, tone = "neutral" }: {
    children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "danger" | "info";
}) {
    const map = {
        neutral: "bg-gray-100 text-gray-800", success: "bg-green-100 text-green-800",
        warning: "bg-amber-100 text-amber-900", danger: "bg-red-100 text-red-800", info: "bg-blue-100 text-blue-800"
    } as const;
    return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs ${map[tone]}`}>{children}</span>;
}